/* Computes the opening guess for both agents offline (spec §5 card 04:
   "Hardcode the opening guess"). Deterministic given the word lists in
   public/data/wordle/. Output goes into src/demos/wordle/openers.ts.

   Usage: node scripts/compute-openers.mjs   (takes ~a minute) */

import { readFileSync } from 'node:fs';

const answers = readFileSync('public/data/wordle/answers.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const extra = readFileSync('public/data/wordle/guesses.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const guesses = [...answers, ...extra];

// Mirrors patternOf in src/demos/wordle/engine.ts.
function patternOf(guess, answer) {
  const counts = new Array(26).fill(0);
  const result = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = 2;
    else counts[answer.charCodeAt(i) - 97]++;
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 2) continue;
    const c = guess.charCodeAt(i) - 97;
    if (counts[c] > 0) {
      result[i] = 1;
      counts[c]--;
    }
  }
  return result[0] + 3 * (result[1] + 3 * (result[2] + 3 * (result[3] + 3 * result[4])));
}

const ALL_GREEN = 242;
const n = answers.length;
const histogram = new Uint16Array(243);
const scored = [];

console.error(`Scoring ${guesses.length} guesses against ${n} answers...`);
for (const word of guesses) {
  histogram.fill(0);
  for (const answer of answers) histogram[patternOf(word, answer)]++;
  let bits = 0;
  let worstCase = 0;
  for (let p = 0; p < 243; p++) {
    const count = histogram[p];
    if (count === 0) continue;
    if (p !== ALL_GREEN && count > worstCase) worstCase = count;
    const prob = count / n;
    bits -= prob * Math.log2(prob);
  }
  scored.push({ word, bits, worstCase });
}

const byEntropy = [...scored].sort((a, b) => b.bits - a.bits).slice(0, 5);
const byMinimax = [...scored].sort((a, b) => a.worstCase - b.worstCase).slice(0, 5);

console.log('Top 5 by entropy (expected bits):');
for (const s of byEntropy) console.log(`  ${s.word}  ${s.bits.toFixed(4)} bits, worst case ${s.worstCase}`);
console.log('Top 5 by minimax (worst-case bucket):');
for (const s of byMinimax) console.log(`  ${s.word}  worst case ${s.worstCase}, ${s.bits.toFixed(4)} bits`);
