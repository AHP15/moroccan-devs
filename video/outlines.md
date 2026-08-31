# Screencast outlines

Two videos. They deliberately do different jobs:

- **Video 1** is the story — it proves you can find a market insight and explain it. This is
  the one that can actually spread in Arabic developer communities.
- **Video 2** is the tutorial — it proves you can teach a developer to use a product, which
  is the daily work of the role.

Record 1 first. It is more interesting and will make you less stiff for 2.

---

## Video 1 — «لماذا لا تجد محتوى تقنياً عربياً؟ قِسْتُ السبب»

**~8 minutes. Screen only, no slides.** Based on `/posts/tatabbo-al-kalimat-al-arabiya`.

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:20 | **Hook — no intro.** Search the query live in Google. Do not explain who you are yet. | `google.com.sa`, Arabic query typed live |
| 0:20–1:00 | The question: is Arabic technical content *weak*, or *absent*? Opinions are cheap — measure it. | Same page, scrolling the results |
| 1:00–2:15 | Method. Three markets. Why the domain, country and language must be set **together** — changing `gl` alone gives a page no real user sees. | `rank_tracker.py`, the `Market` dataclass |
| 2:15–3:00 | **The `num` trap.** Google dropped it in 2025; tools still using `num=100` see ten results and report false negatives. | The `fetch_serp` docstring |
| 3:00–4:15 | Run it live. Let the output scroll. Do not narrate every line. | Terminal, real run |
| 4:15–5:45 | **The money shot.** The rank table, then back to the live SERP: count the `translate.google.com` results on camera. Six of eight. Say the number out loud, then pause. | Split: results table, then the SERP |
| 5:45–6:45 | Second finding: overlap 0.59 for educational queries, **0.00** for local commercial. Ten Egyptian agencies, ten Saudi, ten Emirati, no name repeating. | `serp-overlap` output |
| 6:45–7:30 | What it means: page one in Arabic technical topics is not crowded, it is *vacant*. One well-written original article often ranks. | Back to the blog post |
| 7:30–8:00 | Where the code and raw data are. One line about the blog. Stop. | The repo |

**The single most important 20 seconds** is 4:15. Counting the translate.google.com results
on camera is far more convincing than stating the number. Let it breathe.

---

## Video 2 — «أول طلب لك إلى SerpApi في خمس دقائق»

**~7 minutes. Live coding, one take.** Based on `/posts/awwal-talab-serpapi`.

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:15 | **Show the finished JSON first**, then: "this is what we are building." Never open with setup. | Terminal with the final output |
| 0:15–0:45 | Get the key. Put it in an environment variable — and say *why*: a key in a Git commit stays in the history even after you delete it. | SerpApi dashboard, then `export` |
| 0:45–2:15 | Write the first request from scratch in Python. Type it, do not paste. Run it. | Editor + terminal side by side |
| 2:15–3:00 | Read the response. **The diagnostic tip:** when results look wrong, read `search_parameters` first — it shows how your request was actually understood, and a mistyped parameter is ignored silently. | JSON output |
| 3:00–4:30 | **The memorable moment.** Change `google_domain` and `gl` from Egypt to Saudi, rerun, and show the results change on camera. This is the whole thesis of the blog in one edit. | Two runs, side by side |
| 4:30–5:30 | `429` and exponential backoff. Why retrying immediately makes it worse. | The retry function |
| 5:30–6:15 | The same request in JavaScript and cURL — quickly, just so people can find their language. | The `CodeTabs` block on the post |
| 6:15–6:45 | What to build next. Point at video 1. Stop. | The blog |

---

## Production notes

**Language register — this matters most.** Do **not** record in Darija. A Moroccan dialect
will not be followed in Cairo, Riyadh or Amman, and those are the markets that matter. Use
spoken MSA softened toward the neutral «اللهجة البيضاء» — the register Arabic tech YouTubers
actually use. Technical terms stay in English, spoken as English: say `rate limiting`, not a
translation nobody searches for. This mirrors the blog's editorial rule exactly.

**Font size is the most common failure.** Terminal at 18pt minimum, editor at 18–20pt,
browser zoom 125–150%. Most viewers are on a phone. If you cannot read it on your own phone
after recording, re-record.

**Terminal RTL is unreliable.** The tools print Arabic keywords, and terminal emulators
handle bidi inconsistently. Check how your terminal renders the run before recording — if it
looks scrambled, show the CSV or JSON output in the editor instead.

**Script only the first 20 seconds and the last 20.** The opening decides whether anyone
stays, and the ending is where people ramble. Everything between should be spoken, not read —
scripted middles sound robotic.

**No channel intro, no music, no "don't forget to subscribe."** Get to the substance inside
15 seconds. One take with small mistakes beats a polished video that never gets recorded.

**Face cam is optional.** A small corner cam builds recognition, which is worth something in
developer relations — but not at the cost of not recording. Skip it if it delays you.

**After recording:** upload to YouTube, then upload **natively** to X and LinkedIn as well.
Native video gets far more reach than a link. Add an Arabic subtitle file by hand — YouTube's
auto-captions for Arabic are poor, and manual captions measurably improve both reach and
accessibility.

**Titles and descriptions in Arabic**, with the English technical terms left in English —
that is what people actually type into search.
