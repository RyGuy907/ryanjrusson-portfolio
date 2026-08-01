/* Finds answer words where the two agents' games diverge in interesting
   ways (different turn counts, different intermediate guesses) — used to
   pick the walked-through game for /work/wordle.

   Usage: node scripts/find-divergence.mjs */

import { readFileSync } from 'node:fs';

const answers = readFileSync('public/data/wordle/answers.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const extra = readFileSync('public/data/wordle/guesses.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const allGuesses = [...answers, ...extra];
const answerSet = new Set(answers);
const ALL_GREEN = 242;

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

function scoreAll(candidates) {
  const n = candidates.length;
  const histogram = new Uint16Array(243);
  return allGuesses.map((word) => {
    histogram.fill(0);
    for (const answer of candidates) histogram[patternOf(word, answer)]++;
    let bits = 0;
    let worstCase = 0;
    for (let p = 0; p < 243; p++) {
      const count = histogram[p];
      if (count === 0) continue;
      if (p !== ALL_GREEN && count > worstCase) worstCase = count;
      const prob = count / n;
      bits -= prob * Math.log2(prob);
    }
    return { word, bits, worstCase, isCandidate: answerSet.has(word) };
  });
}

function bestGuess(agent, candidates) {
  if (candidates.length <= 2) return candidates[0];
  const scored = scoreAll(candidates);
  scored.sort(
    agent === 'entropy'
      ? (a, b) => b.bits - a.bits || b.isCandidate - a.isCandidate || a.worstCase - b.worstCase
      : (a, b) => a.worstCase - b.worstCase || b.isCandidate - a.isCandidate || b.bits - a.bits
  );
  return scored[0].word;
}

const OPENERS = { entropy: 'soare', minimax: 'raise' };
const decisionCache = new Map();

function solveWord(agent, secret) {
  let candidates = answers;
  let historyKey = agent;
  const trace = [];
  for (let turn = 1; turn <= 10; turn++) {
    const guess =
      turn === 1
        ? OPENERS[agent]
        : (decisionCache.get(historyKey) ??
          (() => {
            const g = bestGuess(agent, candidates);
            decisionCache.set(historyKey, g);
            return g;
          })());
    const pattern = patternOf(guess, secret);
    trace.push({ turn, guess, pattern, candidatesBefore: candidates.length });
    if (pattern === ALL_GREEN) return trace;
    candidates = candidates.filter((w) => patternOf(guess, w) === pattern);
    historyKey += `|${guess}:${pattern}`;
  }
  return trace;
}

function patternToString(p) {
  const chars = [];
  for (let i = 0; i < 5; i++) {
    chars.push(['.', 'y', 'G'][p % 3]);
    p = Math.floor(p / 3);
  }
  return chars.join('');
}

const interesting = [];
for (const secret of answers) {
  const e = solveWord('entropy', secret);
  const m = solveWord('minimax', secret);
  // Diverging guess paths after turn 1 AND different finish times.
  const sharedMiddle = e.length > 2 && m.length > 2 && e[1].guess === m[1].guess;
  if (e.length !== m.length && !sharedMiddle) {
    interesting.push({ secret, e, m });
  }
}

console.log(`${interesting.length} answers with fully diverging paths and different turn counts\n`);
for (const { secret, e, m } of interesting.slice(0, 12)) {
  console.log(`=== ${secret}  (entropy ${e.length}, minimax ${m.length})`);
  for (const t of e) console.log(`  E turn ${t.turn}: ${t.guess}  ${patternToString(t.pattern)}  (${t.candidatesBefore} before)`);
  for (const t of m) console.log(`  M turn ${t.turn}: ${t.guess}  ${patternToString(t.pattern)}  (${t.candidatesBefore} before)`);
  console.log();
}
