/**
 * Renders the raster icon fallbacks from public/favicon.svg.
 *
 * Browsers that take the SVG favicon need nothing else, but iOS home screens, Android
 * install prompts and old Windows shells do not read SVG — hence the PNGs and the .ico.
 * Everything here is derived, so the SVG stays the single source of truth for the mark.
 *
 * Run with `npm run icons` after changing the mark.
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC = join(process.cwd(), 'public');
const source = readFileSync(join(PUBLIC, 'favicon.svg'), 'utf8');

/** resvg has no prefers-color-scheme, so pin the light-mode blue for every raster. */
const LIGHT = source.replace(/<style>[\s\S]*?<\/style>/, '');
const STAR_FILL = '#6169ee';
const flat = LIGHT.replace('class="star"', `fill="${STAR_FILL}" stroke="${STAR_FILL}"`);

const render = (svg, size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: 'rgba(0,0,0,0)' })
    .render()
    .asPng();

/**
 * iOS crops the corners off and composites onto black if the icon is transparent, so the
 * touch icon gets an opaque tile and 12.5% padding of its own.
 */
function touchIcon(size) {
  const pad = Math.round(size * 0.125);
  const inner = size - pad * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#fbfaf8"/>
  <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 32 32">${flat.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>
</svg>`;
  return render(svg, size);
}

/** ICO directory pointing at embedded PNGs — the format has allowed PNG payloads since Vista. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const write = (name, data) => {
  writeFileSync(join(PUBLIC, name), data);
  console.log(`  ${name}  ${(data.length / 1024).toFixed(1)} kB`);
};

console.log('Building icons from public/favicon.svg');
write('icon-192.png', render(flat, 192));
write('icon-512.png', render(flat, 512));
write('apple-touch-icon.png', touchIcon(180));
write('favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: render(flat, size) }))));
