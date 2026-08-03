/* Generates public/og.png (1200x630) — the Open Graph share card, which also
   serves as the LinkedIn "Featured" thumbnail. Matches the live site's
   palette; the name is rendered from the real Bricolage Grotesque outlines
   since the renderer has no access to webfonts.

   Usage: node scripts/og-image.mjs public/og.png [path-to-bricolage.ttf] */

import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';

const out = process.argv[2] ?? 'public/og.png';
const ttf = process.argv[3] ?? `${process.env.TEMP}/bricolage.ttf`;

const PAPER = '#F8ECE0';
const BAND = '#1B3B5F';
const INK = '#171C23';
const MUTED = '#5C6672';
const SURFACE = '#FFFFFF';
const RULE = '#C9C4BF';

const font = opentype.parse(readFileSync(ttf).buffer);

/* Compose the path one glyph at a time. font.getPath() runs the shaping
   engine, which throws on this font's GSUB table for multi-character
   strings; per-glyph lookup sidesteps it. */
function textPath(text, x, y, size) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  let d = '';
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    d += glyph.getPath(cursor, y, size).toPathData(2) + ' ';
    cursor += glyph.advanceWidth * scale;
  }
  return d.trim();
}

const namePath = textPath('Ryan Russon', 80, 250, 96);

const line = 'CS senior at BYU with production software in daily use.';
const tags = ['Python automation', 'React / Svelte', 'AWS', 'CI/CD'];

const tagBoxes = tags
  .map((t, i) => {
    const w = 235;
    const x = 80 + i * (w + 16);
    return `<rect x="${x}" y="430" width="${w}" height="64" rx="2" fill="${SURFACE}" stroke="${RULE}"/>
      <text x="${x + w / 2}" y="470" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="21" fill="${INK}">${t}</text>`;
  })
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="18" fill="${BAND}"/>

  <path d="${namePath}" fill="${INK}"/>

  <text x="80" y="320" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="${MUTED}">${line}</text>
  <text x="80" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="${MUTED}">Graduating December 2026.</text>

  ${tagBoxes}

  <rect y="588" width="1200" height="42" fill="${BAND}"/>
  <text x="80" y="616" font-family="Consolas, monospace" font-size="19"
    letter-spacing="1.5" fill="${PAPER}">RYANJRUSSON.COM</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`${out} written`);
