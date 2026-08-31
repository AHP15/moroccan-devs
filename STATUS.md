# MoroccanDevs — readiness report

**Compiled 31 August 2026** from the repo at `dfd141e`, a clean build, and a live check of
production. Measurement data in `tools/rank-tracker/data/`.

---

## Verdict: two blockers from applying

The hard part is done. Four Arabic posts backed by original measured data, two open-source
tools, and a written market plan — more than most Developer Advocate applicants bring to a
first interview. What remains is not building. It is **pushing two commits and rotating a
key**, then sending the email.

| | |
|---|---|
| Arabic posts, none draft | **4** |
| Words of Arabic prose | **2,726** |
| Open-source tools | **2** |
| Searches of real data | **42** |
| Type errors | **0** |
| Pages built | **16** |

---

## Blockers

### 1. Two commits are unpushed — CONFIRMED BROKEN IN PRODUCTION

`3cd020a` and `dfd141e` are local only. One adds the hidden `embed=1` field Buttondown
requires. I checked the live page: the field is **absent**, so the newsletter form on
moroccandevs.com is currently submitting without it. The other commit adds the two
newsletter emails.

```bash
git push origin main   # then redeploy
```

### 2. The SerpApi key is still live

It was pasted into a chat transcript. It is **not** in the repo — every staged file was
scanned for the full key and for any 32-character hex string, and the tree is clean — but a
pasted key should be treated as burned. Rotate it. Nothing deployed depends on it.

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
  `dc6cda41-…`. This resolves the earlier "unverified" item.
- **Newsletter is wired** to `buttondown.com/api/emails/embed-subscribe/moroccandevs` —
  but missing `embed=1` until you push.
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

1. **Push and redeploy** — `git push origin main`. Fixes the live newsletter form.
2. **Rotate the SerpApi key** — two minutes in their dashboard.
3. **Spot-check in a browser** — newsletter accepts a test address, RTL looks right on a phone.
4. **Record two screencasts** — posts 2 and 3. Rough is fine.
5. **Spend a week in the communities** — answering, not promoting. Run in parallel.
6. **Send the application** — resume to `careers@serpapi.com`, subject naming the role.
   Lead with the finding, not the blog.
