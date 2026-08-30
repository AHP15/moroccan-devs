#!/usr/bin/env python3
"""
مِرصاد — Arabic SERP rank tracker built on SerpApi.

An Arabic keyword does not have a rank. It has a matrix of ranks, one per Arab market,
because each country defaults to its own Google domain and regional content dominates in
each. This measures that matrix.

Usage:
    export SERPAPI_KEY="..."
    python rank_tracker.py --domain example.com --keywords keywords.txt
    python rank_tracker.py --domain example.com --keywords keywords.txt --dry-run

Depth comes from paginating with `start`, not from `num`: Google discontinued returning
100 results per page in 2025, so a tool that trusts `num=100` silently sees only ten.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from dataclasses import dataclass
from itertools import product
from pathlib import Path
from urllib.parse import urlparse

import requests

ENDPOINT = "https://serpapi.com/search"


def load_dotenv() -> None:
    """Read SERPAPI_KEY from a .env file at the repo root, if one exists.

    Hand-rolled rather than pulling in python-dotenv: this needs to read one key from a
    handful of lines, and a tool people run once a week should not carry a dependency for
    that. Real environment variables always win, so `SERPAPI_KEY=... python rank_tracker.py`
    still overrides the file.
    """
    env_file = Path(__file__).resolve().parents[2] / ".env"
    if not env_file.is_file():
        return

    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if key in os.environ:
            continue
        os.environ[key] = value.strip().strip("\"'")


@dataclass(frozen=True)
class Market:
    """One Arab market. The domain, country and language belong together, not apart.

    Setting `gl` alone while leaving the domain on google.com produces a combination no
    real user ever sees: an international domain with a local bias.
    """

    code: str
    name_ar: str
    name_en: str
    google_domain: str
    gl: str
    hl: str = "ar"


MARKETS: dict[str, Market] = {
    m.code: m
    for m in [
        Market("ma", "المغرب", "Morocco", "google.co.ma", "ma"),
        Market("dz", "الجزائر", "Algeria", "google.dz", "dz"),
        Market("tn", "تونس", "Tunisia", "google.tn", "tn"),
        Market("eg", "مصر", "Egypt", "google.com.eg", "eg"),
        Market("sa", "السعودية", "Saudi Arabia", "google.com.sa", "sa"),
        Market("ae", "الإمارات", "UAE", "google.ae", "ae"),
        Market("qa", "قطر", "Qatar", "google.com.qa", "qa"),
        Market("kw", "الكويت", "Kuwait", "google.com.kw", "kw"),
        Market("jo", "الأردن", "Jordan", "google.jo", "jo"),
        Market("iq", "العراق", "Iraq", "google.iq", "iq"),
    ]
}

DEFAULT_MARKETS = ["ma", "eg", "sa", "ae", "jo"]


class SerpApiError(RuntimeError):
    pass


def fetch_serp(
    session: requests.Session,
    keyword: str,
    market: Market,
    api_key: str,
    start: int = 0,
    max_attempts: int = 5,
) -> list[dict]:
    """One page of organic results for one keyword in one market.

    Deliberately does not send `num`. Google discontinued support for returning up to 100
    results on a single page in 2025, and requests that set it now mostly come back with
    ten results anyway — which would make this tool report "not found" for any domain
    ranking below 10. Depth comes from paginating with `start` instead.

    Retries 429 with exponential backoff. Retrying immediately after a rate-limit response
    adds load without improving the odds; backing off gives the request a chance to succeed.
    """
    params = {
        "engine": "google",
        "q": keyword,
        "google_domain": market.google_domain,
        "gl": market.gl,
        "hl": market.hl,
        "start": start,
        "api_key": api_key,
    }

    for attempt in range(max_attempts):
        try:
            response = session.get(ENDPOINT, params=params, timeout=30)
        except requests.RequestException as exc:
            if attempt == max_attempts - 1:
                raise SerpApiError(f"network error for {keyword!r} / {market.code}: {exc}") from exc
            time.sleep(2**attempt)
            continue

        if response.status_code == 429:
            time.sleep(2**attempt)
            continue

        if response.status_code >= 400:
            # SerpApi returns a JSON body with an "error" key for most failures.
            try:
                detail = response.json().get("error", response.text[:200])
            except ValueError:
                detail = response.text[:200]
            raise SerpApiError(f"HTTP {response.status_code} for {keyword!r} / {market.code}: {detail}")

        payload = response.json()
        if "error" in payload:
            raise SerpApiError(f"{keyword!r} / {market.code}: {payload['error']}")
        return payload.get("organic_results", [])

    raise SerpApiError(f"rate limited after {max_attempts} attempts: {keyword!r} / {market.code}")


def normalize(host: str) -> str:
    """Fold host variants so www.example.com and example.com compare equal.

    Without this a domain looks absent from the results purely because Google returned it
    with a www prefix, and you lose time debugging a problem that does not exist.
    """
    return host.lower().removeprefix("www.")


def find_rank(
    results: list[dict],
    target_domain: str,
    offset: int = 0,
    include_subdomains: bool = False,
) -> int | None:
    """Absolute rank of the first result on the target domain, or None if absent.

    Rank is computed from the page offset and the index within the page rather than read
    from the `position` field, so it stays absolute and correct across paginated requests
    regardless of how the API numbers results within a page.
    """
    target = normalize(target_domain)
    for i, result in enumerate(results):
        host = normalize(urlparse(result.get("link", "")).netloc)
        if host == target or (include_subdomains and host.endswith("." + target)):
            return offset + i + 1
    return None


RESULTS_PER_PAGE = 10


def fetch_rank(
    session: requests.Session,
    keyword: str,
    market: Market,
    api_key: str,
    target_domain: str,
    depth: int,
    include_subdomains: bool,
    delay: float,
) -> tuple[int | None, int]:
    """Page through results until the domain is found or `depth` is exhausted.

    Returns (rank, searches_used). Stopping as soon as the domain is found matters: each
    page is a billable search, and most domains you track will rank on page one.
    """
    used = 0
    for offset in range(0, depth, RESULTS_PER_PAGE):
        if used:
            time.sleep(delay)
        results = fetch_serp(session, keyword, market, api_key, start=offset)
        used += 1
        if not results:
            break  # ran out of results before running out of depth
        rank = find_rank(results, target_domain, offset, include_subdomains)
        if rank is not None:
            return rank, used
    return None, used


def dispersion(ranks: dict[str, int | None]) -> int | None:
    """Spread between best and worst rank, ignoring markets where the domain is absent.

    This is the number that matters more than any single rank: high dispersion means one
    content strategy is not serving the whole Arabic market.
    """
    present = [r for r in ranks.values() if r is not None]
    if len(present) < 2:
        return None
    return max(present) - min(present)


def build_matrix(
    keywords: list[str],
    markets: list[Market],
    target_domain: str,
    api_key: str,
    depth: int,
    delay: float,
    include_subdomains: bool,
) -> tuple[dict[str, dict[str, int | None]], int]:
    matrix: dict[str, dict[str, int | None]] = {}
    session = requests.Session()
    total = len(keywords) * len(markets)
    done = 0
    spent = 0

    for keyword, market in product(keywords, markets):
        done += 1
        rank, used = fetch_rank(
            session, keyword, market, api_key, target_domain, depth, include_subdomains, delay
        )
        spent += used
        matrix.setdefault(keyword, {})[market.code] = rank

        shown = rank if rank is not None else f"not in top {depth}"
        print(f"[{done}/{total}] {keyword} · {market.name_en}: {shown}", flush=True)

        if done < total:
            time.sleep(delay)

    return matrix, spent


def write_csv(matrix, markets: list[Market], path: Path) -> None:
    # utf-8-sig: without the BOM, Excel renders Arabic headers as mojibake.
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["keyword", *(m.code for m in markets), "dispersion"])
        for keyword, ranks in matrix.items():
            spread = dispersion(ranks)
            writer.writerow([
                keyword,
                *("" if ranks.get(m.code) is None else ranks[m.code] for m in markets),
                "" if spread is None else spread,
            ])


def write_json(matrix, markets: list[Market], target_domain: str, path: Path) -> None:
    path.write_text(
        json.dumps(
            {
                "domain": target_domain,
                "markets": [
                    {"code": m.code, "name_ar": m.name_ar, "name_en": m.name_en, "google_domain": m.google_domain}
                    for m in markets
                ],
                "results": [
                    {"keyword": k, "ranks": r, "dispersion": dispersion(r)} for k, r in matrix.items()
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def print_summary(matrix, markets: list[Market]) -> None:
    """A right-aligned table of the matrix, plus the dispersion column."""
    width = max((len(k) for k in matrix), default=7)
    header = "keyword".ljust(width) + "".join(m.code.rjust(6) for m in markets) + "  spread"
    print("\n" + header)
    print("-" * len(header))

    for keyword, ranks in matrix.items():
        cells = "".join(
            (str(ranks[m.code]) if ranks.get(m.code) is not None else "—").rjust(6) for m in markets
        )
        spread = dispersion(ranks)
        print(keyword.ljust(width) + cells + ("" if spread is None else str(spread)).rjust(8))

    ranked = [d for d in (dispersion(r) for r in matrix.values()) if d is not None]
    if ranked:
        print(f"\nMedian dispersion across keywords: {sorted(ranked)[len(ranked) // 2]}")
    print(
        "\nA high spread means the same keyword ranks very differently across Arab markets — "
        "one number would have hidden that entirely."
    )


def load_keywords(args) -> list[str]:
    if args.keywords:
        lines = Path(args.keywords).read_text(encoding="utf-8").splitlines()
        # '#' starts a comment so keyword files can be annotated.
        return [k.strip() for k in lines if k.strip() and not k.lstrip().startswith("#")]
    return [k.strip() for k in args.keyword if k.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Measure how one domain ranks for Arabic keywords across Arab markets.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--domain", required=True, help="Target domain, e.g. example.com")
    parser.add_argument("--keywords", help="File with one Arabic keyword per line")
    parser.add_argument("--keyword", action="append", default=[], help="A single keyword (repeatable)")
    parser.add_argument(
        "--markets",
        default=",".join(DEFAULT_MARKETS),
        help=f"Comma-separated market codes. Available: {','.join(MARKETS)}",
    )
    parser.add_argument(
        "--depth",
        type=int,
        default=30,
        help="How deep to look, in results (default 30). Costs one search per 10 results, "
        "but stops early once the domain is found.",
    )
    parser.add_argument("--delay", type=float, default=1.0, help="Seconds between requests (default 1.0)")
    parser.add_argument("--out", default="rank-matrix", help="Output basename; writes .csv and .json")
    parser.add_argument("--include-subdomains", action="store_true", help="Count subdomains as the target")
    parser.add_argument("--dry-run", action="store_true", help="Show the planned queries and cost, call nothing")
    parser.add_argument("-y", "--yes", action="store_true", help="Skip the confirmation prompt")
    args = parser.parse_args()

    keywords = load_keywords(args)
    if not keywords:
        parser.error("no keywords given — pass --keywords FILE or --keyword WORD")

    unknown = [c for c in args.markets.split(",") if c.strip() and c.strip() not in MARKETS]
    if unknown:
        parser.error(f"unknown market code(s): {', '.join(unknown)}. Available: {', '.join(MARKETS)}")
    markets = [MARKETS[c.strip()] for c in args.markets.split(",") if c.strip()]

    if args.depth < 1:
        parser.error("--depth must be at least 1")

    pages = -(-args.depth // RESULTS_PER_PAGE)  # ceil
    pairs = len(keywords) * len(markets)
    best_case, worst_case = pairs, pairs * pages

    print(f"Domain:   {args.domain}")
    print(f"Keywords: {len(keywords)}")
    print(f"Markets:  {len(markets)} ({', '.join(m.code for m in markets)})")
    print(f"Depth:    top {args.depth} ({pages} page{'s' if pages > 1 else ''} max per pair)")
    # Every page request is a billable search. The free plan is 100 searches a month, so a
    # 10-keyword run across 5 markets at depth 30 could consume 150 of them in one command.
    print(
        f"Searches: {best_case}–{worst_case} against your SerpApi quota "
        f"(the low end if everything ranks on page one)\n"
    )

    if args.dry_run:
        for keyword, market in product(keywords, markets):
            print(f"  {keyword} → {market.google_domain} (gl={market.gl}, hl={market.hl})")
        print("\nDry run — nothing was requested.")
        return 0

    load_dotenv()
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key:
        print(
            "SERPAPI_KEY is not set. Either:\n"
            "  export SERPAPI_KEY='your-key'\n"
            "or add this line to the .env file at the repo root:\n"
            "  SERPAPI_KEY=your-key\n\n"
            "Do not name it PUBLIC_SERPAPI_KEY — Astro inlines PUBLIC_ variables into the\n"
            "built site, which would publish your key.",
            file=sys.stderr,
        )
        return 1

    if not args.yes and sys.stdin.isatty():
        if input(f"Run up to {worst_case} searches? [y/N] ").strip().lower() not in {"y", "yes"}:
            print("Aborted.")
            return 0

    try:
        matrix, spent = build_matrix(
            keywords, markets, args.domain, api_key, args.depth, args.delay, args.include_subdomains
        )
    except SerpApiError as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        return 130

    csv_path, json_path = Path(f"{args.out}.csv"), Path(f"{args.out}.json")
    write_csv(matrix, markets, csv_path)
    write_json(matrix, markets, args.domain, json_path)
    print_summary(matrix, markets)
    print(f"\nSearches used: {spent}")
    print(f"Wrote {csv_path} and {json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
