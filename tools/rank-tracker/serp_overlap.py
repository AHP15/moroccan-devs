#!/usr/bin/env python3
"""
Measure how much a Google SERP changes between Arab markets for the same Arabic query.

The rank tracker answers "where does my domain rank in each market". This answers the
prior question: does the result page differ across markets at all? If the same ten domains
appear everywhere, "Arabic search results" really is one thing and per-market tracking buys
you nothing. If they diverge, a single rank number is hiding the divergence.

Overlap is Jaccard similarity over the set of domains in the top N, which ignores ordering.
Two markets showing the same ten domains in a different order are far more alike than two
markets showing different domains, and the metric should say so.

Usage:
    export SERPAPI_KEY="..."
    python serp_overlap.py --keywords keywords.txt --markets eg,sa,ae
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from itertools import combinations
from pathlib import Path
from urllib.parse import urlparse

import requests

from rank_tracker import MARKETS, Market, SerpApiError, fetch_serp, load_dotenv, normalize


def top_domains(results: list[dict], limit: int) -> list[str]:
    """Ordered, de-duplicated domains from a result page.

    De-duplicated because a single site holding three slots should count once when asking
    "which sites own this page", not three times.
    """
    seen: list[str] = []
    for result in results[:limit]:
        host = normalize(urlparse(result.get("link", "")).netloc)
        if host and host not in seen:
            seen.append(host)
    return seen


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 1.0
    return len(a & b) / len(a | b)


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare Google SERPs for one query across Arab markets.")
    parser.add_argument("--keywords", help="File with one Arabic keyword per line")
    parser.add_argument("--keyword", action="append", default=[], help="A single keyword (repeatable)")
    parser.add_argument("--markets", default="eg,sa,ae", help=f"Comma-separated. Available: {','.join(MARKETS)}")
    parser.add_argument("--top", type=int, default=10, help="Compare the top N results (default 10)")
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--out", default="serp-overlap")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("-y", "--yes", action="store_true")
    args = parser.parse_args()

    if args.keywords:
        lines = Path(args.keywords).read_text(encoding="utf-8").splitlines()
        keywords = [k.strip() for k in lines if k.strip() and not k.lstrip().startswith("#")]
    else:
        keywords = [k.strip() for k in args.keyword if k.strip()]
    if not keywords:
        parser.error("no keywords given — pass --keywords FILE or --keyword WORD")

    unknown = [c for c in args.markets.split(",") if c.strip() and c.strip() not in MARKETS]
    if unknown:
        parser.error(f"unknown market code(s): {', '.join(unknown)}")
    markets: list[Market] = [MARKETS[c.strip()] for c in args.markets.split(",") if c.strip()]
    if len(markets) < 2:
        parser.error("need at least two markets to compare")

    searches = len(keywords) * len(markets)
    print(f"Keywords: {len(keywords)}\nMarkets:  {len(markets)} ({', '.join(m.code for m in markets)})")
    print(f"Searches: {searches} against your SerpApi quota\n")

    if args.dry_run:
        print("Dry run — nothing was requested.")
        return 0

    load_dotenv()
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key:
        print("SERPAPI_KEY is not set.", file=sys.stderr)
        return 1
    if not args.yes and sys.stdin.isatty():
        if input(f"Run {searches} searches? [y/N] ").strip().lower() not in {"y", "yes"}:
            return 0

    session = requests.Session()
    report = []

    try:
        for keyword in keywords:
            per_market: dict[str, list[str]] = {}
            for market in markets:
                results = fetch_serp(session, keyword, market, api_key, start=0)
                per_market[market.code] = top_domains(results, args.top)
                time.sleep(args.delay)

            sets = {code: set(domains) for code, domains in per_market.items()}
            pairs = {
                f"{a}/{b}": round(jaccard(sets[a], sets[b]), 2) for a, b in combinations(sets, 2)
            }
            shared = set.intersection(*sets.values()) if sets else set()
            unique = {code: sorted(s - set.union(*(v for k, v in sets.items() if k != code))) for code, s in sets.items()}

            report.append(
                {"keyword": keyword, "per_market": per_market, "overlap": pairs,
                 "shared": sorted(shared), "unique": unique}
            )

            print(f"\n=== {keyword} ===")
            for code, domains in per_market.items():
                print(f"  {code}: {', '.join(domains[:6])}{' …' if len(domains) > 6 else ''}")
            print(f"  overlap: {pairs}")
            print(f"  shared by all: {len(shared)}/{args.top}")
            for code, only in unique.items():
                if only:
                    print(f"  only in {code}: {', '.join(only)}")
    except SerpApiError as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        return 1

    Path(f"{args.out}.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    all_pairs = [v for entry in report for v in entry["overlap"].values()]
    if all_pairs:
        avg = sum(all_pairs) / len(all_pairs)
        print(f"\nMean pairwise overlap across all keywords and market pairs: {avg:.2f}")
        print(
            "1.00 means the markets return the same domains and per-market tracking is "
            "unnecessary; near 0 means they are effectively different search engines."
        )
    print(f"Wrote {args.out}.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
