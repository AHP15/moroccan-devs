/**
 * OG image rendering needs real TTFs on disk (resvg's fontdb cannot read the woff2 files
 * that @fontsource ships). They are gitignored, so CI and fresh clones fetch them here.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src/assets/fonts');
const BASE = 'https://raw.githubusercontent.com/IBM/plex/master/packages';
const FONTS = [
  ['IBMPlexSansArabic-Bold.ttf', `${BASE}/plex-sans-arabic/fonts/complete/ttf/IBMPlexSansArabic-Bold.ttf`],
  ['IBMPlexSansArabic-Regular.ttf', `${BASE}/plex-sans-arabic/fonts/complete/ttf/IBMPlexSansArabic-Regular.ttf`],
  ['IBMPlexMono-Regular.ttf', `${BASE}/plex-mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf`],
];

await mkdir(DIR, { recursive: true });

for (const [name, url] of FONTS) {
  const path = join(DIR, name);
  try {
    await access(path);
    console.log(`✓ ${name} (cached)`);
    continue;
  } catch {
    /* not downloaded yet */
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${name}: ${res.status} ${res.statusText}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
  console.log(`↓ ${name}`);
}
