# مِرصاد — Arabic SERP rank tracker

An Arabic keyword does not have *a* rank. It has a **matrix** of ranks — one per Arab market —
because each country defaults to its own Google domain and regional content dominates in each.
This measures that matrix on top of [SerpApi](https://serpapi.com).

## Setup

```bash
pip install -r requirements.txt
```

Then give it your key from the [SerpApi dashboard](https://serpapi.com/manage-api-key), either way:

```bash
# Option A — this shell session only
export SERPAPI_KEY="your-key"
```

```bash
# Option B — persists; add to the .env file at the REPO ROOT (already gitignored)
SERPAPI_KEY=your-key
```

A real environment variable always wins over `.env`, so you can override it per run:
`SERPAPI_KEY=other-key python rank_tracker.py ...`

> **Never name it `PUBLIC_SERPAPI_KEY`.** Astro inlines every `PUBLIC_` variable into the
> built site, so that prefix would publish your key to anyone who views source. The other
> variables in `.env` are `PUBLIC_` because they are *meant* to reach the browser. This one
> is not — it is read only by this script, never by the site build.

## Run it

```bash
# See what it would cost, without spending anything
python rank_tracker.py --domain example.com --keywords keywords.txt --dry-run

# The real thing
python rank_tracker.py --domain example.com --keywords keywords.txt
```

Writes `rank-matrix.csv` and `rank-matrix.json`, and prints a summary table.

## Options

| Flag | Default | Notes |
| --- | --- | --- |
| `--domain` | *required* | Target domain, e.g. `example.com` |
| `--keywords FILE` | — | One Arabic keyword per line; `#` starts a comment |
| `--keyword WORD` | — | A single keyword; repeatable |
| `--markets` | `ma,eg,sa,ae,jo` | From `ma dz tn eg sa ae qa kw jo iq` |
| `--depth` | `30` | How deep to look, in results |
| `--delay` | `1.0` | Seconds between requests |
| `--out` | `rank-matrix` | Output basename |
| `--include-subdomains` | off | Count `blog.example.com` as the target |
| `--dry-run` | off | Print planned queries and cost, call nothing |
| `-y` | off | Skip the confirmation prompt |

## What it costs

**One page of results is one billable search.** Depth 30 means up to three searches per
keyword–market pair, but the tracker stops as soon as it finds your domain — and most tracked
keywords rank on page one, so real spend lands near the low end.

```
worst case = keywords × markets × ceil(depth / 10)
```

10 keywords × 5 markets × depth 30 = **up to 150 searches**, which exceeds the 100/month free
plan. Start with 5 keywords and 3 markets at depth 20 (up to 30 searches) and grow from there.
The tracker prints the range and asks for confirmation before spending anything.

## Two things that would otherwise bite you

**`num` is dead.** Google discontinued returning 100 results per page in 2025, so a request
setting `num=100` now mostly comes back with ten. Any tracker still trusting it believes it
checked 100 results when it checked 10, and reports "not found" for a domain sitting at #14.
Depth here comes from paginating with `start` instead.

**Set the domain, country and language together.** Changing `gl` while leaving
`google_domain` on `google.com` produces a combination no real user ever sees — an
international domain with a local bias. Each `Market` in the script binds all three, so they
cannot drift apart.

## Reading the output

The column that matters is `dispersion` — the spread between your best and worst rank across
markets. Three patterns are worth acting on:

- **Low dispersion, good ranks** — even presence. Rare.
- **High dispersion** — you lead in one market and are invisible in another. Usually regional
  competition, or the keyword itself being uncommon in that dialect.
- **Absent from exactly one market** — worth a separate look. Often a different term is used
  locally for the same thing.

CSV is written with a BOM so Excel renders the Arabic correctly instead of as mojibake.

---

# serp_overlap.py — do the markets even differ?

`rank_tracker.py` answers "where does my domain rank in each market". This answers the prior
question: **does the result page differ across markets at all?** If the same ten domains
appear everywhere, per-market tracking buys you nothing.

```bash
python serp_overlap.py --keywords keywords.txt --markets eg,sa,ae --top 10
```

Overlap is Jaccard similarity over the *set* of top-N domains, ignoring order — two markets
showing the same sites in a different order are far more alike than two showing different
sites, and the metric should say so. Domains are de-duplicated, because a site holding three
slots should count once when asking who owns the page.

Cost is exactly `keywords × markets` searches — one page each, no pagination.

## What a run of this found

Measured 2026-08-30 across `eg`, `sa`, `ae` (raw data in `data/`):

| keyword | mean overlap | shared by all |
| --- | --- | --- |
| تعلم البرمجة | 0.59 | 5/10 |
| تصميم مواقع | 0.42 | 4/10 |
| استضافة مواقع | 0.10 | 1/10 |
| افضل بنك | 0.03 | 0/10 |
| شركة تسويق الكتروني | 0.00 | 0/10 |

Overlap tracks how *local* the intent is. Educational queries are effectively one pan-Arab
market; local commercial services share literally zero domains across the three countries.
Quote the gradient, not the 0.23 mean — the mean hides the entire finding.
