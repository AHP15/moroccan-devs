# MoroccanDevs

Arabic-language technical blog for developers across the Arab world. Explanations in Modern
Standard Arabic; technical terms, identifiers and code in English.

Built with Astro 5+, Tailwind v4, MDX. Static output, no JS shipped on article pages beyond
the theme toggle, code-tab switcher and copy buttons.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321 — drafts are visible here
npm run build    # downloads OG fonts, then builds to dist/
npm run preview
npm run check    # astro check — must stay at 0 errors
```

## Writing a post

Posts live in `src/content/posts/*.mdx`. The frontmatter schema in `src/content.config.ts`
is enforced at build time, so a malformed post fails the build rather than shipping broken:

```yaml
---
title: 'العنوان بالعربية'
description: 'وصف من 120 إلى 160 حرفاً لنتائج البحث.'
titleEn: 'English title'
abstractEn: 'English abstract, minimum 80 characters.'   # required — see below
pubDate: 2026-08-26
tags: ['SerpApi', 'Python']
series: 'بيانات البحث بالعربية'
seriesOrder: 3
featured: false
draft: false
---
```

`titleEn` and `abstractEn` are mandatory. Every post renders an English summary block, and
`/en` lists all posts in English — the audience for the site is Arabic-speaking, but the
people evaluating it may not read Arabic.

Set `draft: true` to keep a post visible in `npm run dev` while excluding it from production.

### Multi-language code samples

```mdx
import CodeTabs from '~/components/CodeTabs.astro';

<CodeTabs tabs={['Python', 'JavaScript', 'cURL']}>
<Fragment slot="python">

​```python
print("hello")
​```

</Fragment>
</CodeTabs>
```

Slot names are the lowercased, hyphenated tab label. The reader's chosen language persists
across posts via `localStorage`.

## RTL and bidi

`dir="rtl"` on `<html>` is only the start. `src/plugins/rehype-bidi-isolate.mjs` runs on every
post and:

- forces `dir="ltr"` on every `<pre>` and `<code>`, so code is never mirrored;
- wraps bare Latin runs in `<bdi dir="ltr">`, so `serpapi.com/search?q=x` stays one island;
- deliberately leaves sentence-final punctuation *outside* the island, so a full stop after
  `API.` lands at the left edge of the Arabic line rather than mid-sentence.

It skips code subtrees entirely — Shiki has already split code into nested `<span>` elements
by the time it runs, so a parent-only check would wrap half of every highlighted token.

Use the `<Term ar="...">` component for an English term that needs an Arabic gloss on hover.

## Open Graph images

Generated at build time by `src/lib/og.ts` using **resvg**, not satori. Satori has no
complex-script shaper: it renders Arabic letters unjoined and in visual disorder. resvg
shapes through rustybuzz, so Arabic joining and bidi come out correct.

This needs real TTFs (resvg cannot read the woff2 files `@fontsource` ships), which
`npm run fonts` downloads into `src/assets/fonts/`. They are gitignored; `npm run build`
fetches them automatically.

## Configuration

Copy `.env.example` to `.env`. Every integration degrades gracefully when unset:

| Variable | Effect when unset |
| --- | --- |
| `PUBLIC_UMAMI_ID`, `PUBLIC_UMAMI_SRC` | no analytics script is emitted |
| `PUBLIC_BUTTONDOWN_USER` | the newsletter form falls back to a `mailto:` link |

Site name, tagline, author details and navigation live in `src/consts.ts`.

## Deploying

Static output — any host works. Deployed on Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 or newer

`npm run build` downloads the OG fonts first, so no extra build step is needed.

Set `PUBLIC_UMAMI_ID`, `PUBLIC_UMAMI_SRC` and `PUBLIC_BUTTONDOWN_USER` as environment
variables in the Vercel project settings — never in a committed file. Each one degrades
gracefully when absent, so the site builds fine without them.

Set the real domain in `SITE.url` (`src/consts.ts`) before deploying; canonical URLs,
sitemap, RSS and OG image URLs are all derived from it.
