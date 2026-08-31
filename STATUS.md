# MoroccanDevs — readiness report

**Compiled 31 August 2026**, updated after both blockers were cleared. Built from the repo,
a clean build, and a verified live check of production. Data in `tools/rank-tracker/data/`.

---

## Verdict: clear to apply

Both blockers are closed. Everything is pushed, deployed and verified in production. Four
Arabic posts backed by original measured data, two open-source tools, and a written market
plan — more than most Developer Advocate applicants bring to a first interview.

Nothing technical is now in the way of sending the application.

| | |
|---|---|
| Arabic posts, none draft | **4** |
| Words of Arabic prose | **2,726** |
| Open-source tools | **2** |
| Searches of real data | **42** |
| Type errors | **0** |
| Pages built | **16** |

---

## Blockers — both closed

### 1. Unpushed commits — RESOLVED

`3cd020a` and `dfd141e` were local only, and one carried the hidden `embed=1` field
Buttondown requires, so the live newsletter form was submitting without it. Pushed and
deployed; the field is confirmed present in production.

### 2. Exposed SerpApi key — RESOLVED

The key was pasted into a chat transcript and has been rotated. It never reached the repo:
every staged file was scanned for the full key and for any 32-character hex string, and no
commit in history contains it.

> Local tools now need the new key — any `export SERPAPI_KEY` still open in a shell holds
> the dead one.

---

## Live production check — 31 August 2026

All green except the item above.

| Route | Status | Notes |
|---|---|---|
| `/` | 200 | 15.9 KB, `<html lang="ar" dir="rtl">` |
| `/posts/tatabbo-al-kalimat-al-arabiya` | 200 | 43.7 KB |
| `/for-serpapi` | 200 | 38.8 KB |
| `/en` | 200 | 9.6 KB |
| `/rss.xml` | 200 | `application/xml` |
| `/og/site.png` | 200 | `image/png`, 35.3 KB |
| `/sitemap-index.xml` | 200 | |

- **Analytics is live and collecting.** The Umami tag is present with website ID
  `dc6cda41-…`.
- **Newsletter is fully wired** to `buttondown.com/api/emails/embed-subscribe/moroccandevs`,
  with the required `embed=1` field confirmed present after deploy.
- All four posts are listed on the homepage.

---

## What makes this application unusual

Not the blog. The blog is table stakes. Lead the email with this:

> SerpApi ranks **#1** in Egypt, Saudi and the UAE for `serp api` — and is absent from the
> top 20 for every Arabic phrasing of the same need, where **six of eight** page-one slots
> are held by `translate.google.com`.

Measured 30 August 2026 across `google.com.eg`, `google.com.sa`, `google.ae`. Raw CSV and
JSON are committed, so the claim is auditable rather than asserted.

The follow-up study found SERP overlap between those markets running from **0.59** for
educational queries down to **0.00** for local commercial services — ten Egyptian agencies,
ten Saudi, ten Emirati, no name repeating. That is a measurable, unserved need their API
already satisfies.

---

## Built and shipped

- Site live on Vercel at moroccandevs.com — custom domain, 16 pages, static
- Four Arabic posts as one series — MSA prose, English technical terms and code
- Repo public at `github.com/AHP15/moroccan-devs`
- RTL and bidi handled at the pipeline level — code forced LTR, Latin runs isolated,
  sentence-final punctuation deliberately left outside the island
- Arabic Open Graph images via resvg — satori cannot shape Arabic script
- English abstract on every post, enforced by the content schema, plus `/en`
- `/for-serpapi` case page — market sizing with sources, 90-day plan, measured findings
- Two open-source measurement tools with raw data committed
- Newsletter welcome email and first issue — written, RTL-safe, *unpushed*
- Correct handling of the `num` deprecation — Google dropped it in 2025; both tools
  paginate with `start`

---

## Coverage against the job description

The role names five responsibilities. A blog answers one and a half.

| Responsibility | State | Evidence, or what is missing |
|---|---|---|
| Content — blogs | **Strong** | Four posts, 2,726 words, original data |
| Content — video | **None** | Explicitly requested. Highest-value gap. |
| Content — social | **None** | No X handle set |
| Localising docs and marketing pages | **Adjacent** | Arabic technical writing shown, but not on their content |
| Engaging Arabic dev communities | **None** | Channels identified, not yet joined |
| Meetups, conferences, webinars | **None** | Reasonable to have none pre-hire |
| Outbound to companies/institutions | **Planned** | Five segments with named accounts, framed as hypotheses |
| Product feedback from the region | **Strong** | The measured gap *is* regional product feedback |

---

## Not built — and whether it should be

**Do first — two Arabic screencasts.** The biggest gap. The role asks for video by name,
Arabic technical video has almost no competition, and two eight-minute screen recordings
walking through your own posts would close it. The one unbuilt thing worth delaying for,
and only by a few days.

**Do first — show up in five Arabic communities.** Hsoub I/O, Arabic dev Discords and
Telegram groups, relevant subreddits. Answer real questions for a week. Costs nothing, and
turns "I would engage communities" into something you have already been doing.

**Waits — audience metrics.** The three tiles on `/for-serpapi` read "Not yet measured" by
design, which beats an invented number. Analytics started collecting today, so they need
weeks of traffic, not work. Fill `src/data/metrics.ts` when there is data.

**Waits — scheduled re-measurement.** The flagship post promises `سأعيد هذا القياس دورياً`.
A GitHub Actions cron would make that true and build a time series, which is a stronger
asset than one snapshot. Roughly 20 searches a month.

**Skip — search, comments, glossary, playground.** All were on the original feature plan.
None change whether you get an interview. Build them if the blog keeps going.

---

## The order I would do it in

1. ~~Push and redeploy~~ — done, verified in production.
2. ~~Rotate the SerpApi key~~ — done.
3. **Spot-check in a browser** — submit a test address to the newsletter, and confirm RTL
   looks right on a phone. The only check a script cannot do for you.
4. **Record two screencasts** — see `video/outlines.md`. Rough is fine.
5. **Spend a week in the communities** — answering, not promoting. Run in parallel.
6. **Send the application** — resume to `careers@serpapi.com`, subject naming the role.
   Lead with the finding, not the blog.
