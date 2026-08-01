/* Web Worker for the Wordle demo. Owns the word lists and all scoring so the
   main thread never blocks (§3). Interface:
   in:  { type: 'init' }
   in:  { type: 'solve', agent, history: [{ guess, pattern }] }
   out: { type: 'ready', answerCount }
   out: { type: 'solved', agent, topGuesses, candidatesRemaining, sample } */

import {
  filterCandidates,
  rankByEntropy,
  rankByMinimax,
  scoreGuesses,
  type ScoredGuess,
} from './engine';

export type HistoryEntry = { guess: string; pattern: number };

export type SolveRequest =
  | { type: 'init' }
  | { type: 'random' }
  | { type: 'check'; word: string }
  | { type: 'solve'; agent: 'entropy' | 'minimax'; history: HistoryEntry[] };

export type SolveResponse =
  | { type: 'ready'; answerCount: number; randomAnswer: string }
  | { type: 'random'; word: string }
  | { type: 'checked'; word: string; valid: boolean }
  | {
      type: 'solved';
      agent: 'entropy' | 'minimax';
      topGuesses: ScoredGuess[];
      candidatesRemaining: number;
      /** A few of the surviving candidates, for display. */
      sample: string[];
    };

let answers: string[] = [];
let answerSet = new Set<string>();
let allGuesses: string[] = [];

async function init(): Promise<void> {
  const [answersText, guessesText] = await Promise.all([
    fetch('/data/wordle/answers.txt').then((r) => r.text()),
    fetch('/data/wordle/guesses.txt').then((r) => r.text()),
  ]);
  answers = answersText.trim().split('\n').map((w) => w.trim());
  answerSet = new Set(answers);
  allGuesses = [...answers, ...guessesText.trim().split('\n').map((w) => w.trim())];
}

function solve(agent: 'entropy' | 'minimax', history: HistoryEntry[]): SolveResponse {
  let candidates = answers;
  for (const { guess, pattern } of history) {
    candidates = filterCandidates(candidates, guess, pattern);
  }

  const scored = scoreGuesses(allGuesses, candidates);
  const ranked = agent === 'entropy' ? rankByEntropy(scored) : rankByMinimax(scored);

  // With 1-2 candidates left, just guess a candidate — it can win outright.
  const topGuesses =
    candidates.length <= 2
      ? ranked.filter((g) => g.isCandidate).slice(0, 5)
      : ranked.slice(0, 5);

  return {
    type: 'solved',
    agent,
    topGuesses,
    candidatesRemaining: candidates.length,
    sample: candidates.slice(0, 8),
  };
}

self.onmessage = async (event: MessageEvent<SolveRequest>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    await init();
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    postMessage({ type: 'ready', answerCount: answers.length, randomAnswer });
  } else if (msg.type === 'random') {
    postMessage({ type: 'random', word: answers[Math.floor(Math.random() * answers.length)] });
  } else if (msg.type === 'check') {
    /* Must be one of the 2,315 possible answers — the agents' belief state
       contains only those, so anything else would empty it. */
    postMessage({ type: 'checked', word: msg.word, valid: answerSet.has(msg.word) });
  } else if (msg.type === 'solve') {
    postMessage(solve(msg.agent, msg.history));
  }
};
