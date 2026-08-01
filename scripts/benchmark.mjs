/* Benchmarks both TS agents over every answer word, and dumps one
   walked-through game. Decisions are cached by game state, so the full run
   takes seconds. Output feeds the chart on /work/wordle.

   Usage: node scripts/benchmark.mjs [walkthrough-word] */

import { readFileSync } from 'node:fs';

const answers = readFileSync('public/data/wordle/answers.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const extra = readFileSync('public/data/wordle/guesses.txt', 'utf8').trim().split('\n').map((w) => w.trim());
const allGuesses = [...answers, ...extra];
const answerSet = new Set(answers);

const ALL_GREEN = 242;

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

const OPENERS = { entropy: 'soare', minimax: 'arise' };
const decisionCache = new Map(); // agent + history key -> guess

function solveWord(agent, secret, trace = null) {
  let candidates = answers;
  let historyKey = agent;
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
    if (trace) {
      trace.push({ turn, guess, pattern, candidatesBefore: candidates.length });
    }
    if (pattern === ALL_GREEN) return turn;
    candidates = candidates.filter((w) => patternOf(guess, w) === pattern);
    historyKey += `|${guess}:${pattern}`;
  }
  return -1;
}

function patternToString(p) {
  const chars = [];
  for (let i = 0; i < 5; i++) {
    chars.push(['.', 'y', 'G'][p % 3]);
    p = Math.floor(p / 3);
  }
  return chars.join('');
}

for (const agent of ['entropy', 'minimax']) {
  const start = Date.now();
  const distribution = new Map();
  let total = 0;
  let worst = 0;
  for (const secret of answers) {
    const turns = solveWord(agent, secret);
    distribution.set(turns, (distribution.get(turns) ?? 0) + 1);
    total += turns;
    if (turns > worst) worst = turns;
  }
  const dist = [...distribution.entries()].sort((a, b) => a[0] - b[0]);
  console.log(`\n${agent} (opener ${OPENERS[agent]}) — ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`  average ${(total / answers.length).toFixed(4)}, worst ${worst}`);
  console.log(`  distribution: ${dist.map(([k, v]) => `${k}:${v}`).join('  ')}`);
}

const walkthroughWord = process.argv[2] ?? 'shave';
console.log(`\nWalkthrough for "${walkthroughWord}":`);
for (const agent of ['entropy', 'minimax']) {
  const trace = [];
  solveWord(agent, walkthroughWord, trace);
  console.log(`  ${agent}:`);
  for (const t of trace) {
    console.log(
      `    turn ${t.turn}: ${t.guess}  ${patternToString(t.pattern)}  (candidates before: ${t.candidatesBefore})`
    );
  }
}
