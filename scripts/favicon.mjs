/* Generates public/favicon.svg: the letter R from Bricolage Grotesque as a
   vector path on a rounded tile, with a dark-mode variant via a
   prefers-color-scheme media query inside the SVG. Re-run if the palette or
   letter changes.

   Usage: node scripts/favicon.mjs [path-to-bricolage.ttf] */

import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

const ttfPath = process.argv[2] ?? `${process.env.TEMP}/bricolage.ttf`;
const font = opentype.parse(readFileSync(ttfPath).buffer);

// Size the R to sit centered in the 32×32 canvas (no tile — transparent
// background, so the letter can run larger).
const SIZE = 27;
const glyphPath = font.getPath('R', 0, 0, SIZE);
const bounds = glyphPath.getBoundingBox();
const w = bounds.x2 - bounds.x1;
const h = bounds.y2 - bounds.y1;
const dx = (32 - w) / 2 - bounds.x1;
// getPath's y is the baseline; bounds.y1 is the (negative) offset of the
// glyph top relative to it, so this puts the visual top at (32 - h) / 2.
const dy = (32 - h) / 2 - bounds.y1;
const centered = font.getPath('R', dx, dy, SIZE);
const d = centered.toPathData(2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .letter { fill: #1B3B5F; stroke: #1B3B5F; stroke-width: 0.4; }
    @media (prefers-color-scheme: dark) {
      .letter { fill: #F8ECE0; stroke: #F8ECE0; }
    }
  </style>
  <path class="letter" d="${d}" />
</svg>
`;

writeFileSync('public/favicon.svg', svg);
console.log('favicon.svg written, glyph bounds', w.toFixed(1), 'x', h.toFixed(1));
