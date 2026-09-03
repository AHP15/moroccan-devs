import { Resvg } from '@resvg/resvg-js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '~/consts';

/**
 * Open Graph images are rendered with resvg rather than satori, because satori has no
 * complex-script shaper: it renders Arabic letters unjoined and in visual disorder.
 * resvg shapes through rustybuzz, so Arabic joins and bidi come out correct.
 */

const FONT_DIR = join(process.cwd(), 'src/assets/fonts');
const FONTS = [
  join(FONT_DIR, 'IBMPlexSansArabic-Bold.ttf'),
  join(FONT_DIR, 'IBMPlexSansArabic-Regular.ttf'),
  join(FONT_DIR, 'IBMPlexMono-Regular.ttf'),
];

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN = 72;
const TEXT_WIDTH = WIDTH - MARGIN * 2;

/**
 * The site mark: the zellij octagram from public/favicon.svg, on its own 32×32 grid.
 * Kept in sync by hand — it is sixteen fixed vertices and does not change.
 */
const STAR =
  'M30.2 16 26.041 20.159 26.041 26.041 20.159 26.041 16 30.2 11.841 26.041 5.959 26.041 5.959 20.159 1.8 16 5.959 11.841 5.959 5.959 11.841 5.959 16 1.8 20.159 5.959 26.041 5.959 26.041 11.841Z';

/** Places the mark centred on (cx, cy) at the given diameter. */
const star = (cx: number, cy: number, diameter: number, attrs: string) => {
  const scale = diameter / 32;
  return `<g transform="translate(${cx} ${cy}) scale(${scale}) translate(-16 -16)"><path d="${STAR}" ${attrs} stroke-width="2" stroke-linejoin="round"/></g>`;
};

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

/**
 * Approximate advance width in em units. resvg cannot measure text for us before rendering,
 * so wrapping uses a per-character-class estimate. Arabic glyphs are narrower than Latin
 * capitals, and joining makes them narrower still.
 */
function charWidth(ch: string): number {
  const code = ch.codePointAt(0)!;
  if (ch === ' ') return 0.26;
  if (code >= 0x0600 && code <= 0x06ff) return 0.44; // Arabic block
  if (code >= 0x0041 && code <= 0x005a) return 0.62; // A-Z
  if (code >= 0x0030 && code <= 0x0039) return 0.55; // digits
  if (code < 0x0080) return 0.5;
  return 0.5;
}

const measure = (text: string, fontSize: number) =>
  [...text].reduce((sum, ch) => sum + charWidth(ch), 0) * fontSize;

function wrap(text: string, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate, fontSize) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrink the title until it fits in at most `maxLines`, rather than letting it overflow. */
function fitTitle(title: string, maxLines = 4) {
  for (const size of [64, 58, 52, 46, 42]) {
    const lines = wrap(title, size, TEXT_WIDTH);
    if (lines.length <= maxLines) return { size, lines };
  }
  return { size: 42, lines: wrap(title, 42, TEXT_WIDTH).slice(0, maxLines) };
}

export function renderOgImage({ title, kicker }: { title: string; kicker?: string }): ArrayBuffer {
  const missing = FONTS.filter((f) => !existsSync(f));
  if (missing.length) {
    throw new Error(
      `Missing OG fonts: ${missing.join(', ')}. Run \`npm run fonts\` to download them.`,
    );
  }

  const { size, lines } = fitTitle(title);
  const lineHeight = size * 1.42;
  const blockHeight = lines.length * lineHeight;
  // Vertically centred, nudged up to leave room for the footer row.
  const startY = (HEIGHT - blockHeight) / 2 + size * 0.85 - 24;
  const right = WIDTH - MARGIN;

  const titleSvg = lines
    .map(
      (line, i) =>
        `<text x="${right}" y="${startY + i * lineHeight}" font-family="IBM Plex Sans Arabic" font-size="${size}" font-weight="700" fill="#eeecf2" direction="rtl" text-anchor="end">${escapeXml(line)}</text>`,
    )
    .join('');

  const kickerSvg = kicker
    ? `<text x="${right}" y="${MARGIN + 40}" font-family="IBM Plex Sans Arabic" font-size="26" font-weight="500" fill="#8b93ff" direction="rtl" text-anchor="end">${escapeXml(kicker)}</text>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0e0d12"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="#4b4fd6"/>
  ${star(200, 438, 380, 'fill="#4b4fd6" stroke="#4b4fd6" opacity="0.11"')}
  ${kickerSvg}
  ${titleSvg}
  <text x="${right}" y="${HEIGHT - MARGIN}" font-family="IBM Plex Mono" font-size="26" font-weight="400" fill="#a5a1b0" direction="ltr" text-anchor="end">${escapeXml(SITE.name)}</text>
  <text x="${MARGIN}" y="${HEIGHT - MARGIN}" font-family="IBM Plex Sans Arabic" font-size="24" fill="#78748a" direction="rtl" text-anchor="start">${escapeXml(SITE.taglineAr)}</text>
</svg>`;

  const png = new Resvg(svg, {
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'IBM Plex Sans Arabic' },
    fitTo: { mode: 'width', value: WIDTH },
  })
    .render()
    .asPng();

  // Node's Buffer is not a valid BodyInit under Astro's web-standard types; the copy into a
  // fresh Uint8Array gives a plain ArrayBuffer that Response accepts.
  return new Uint8Array(png).buffer as ArrayBuffer;
}

export const PNG_HEADERS = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' };
