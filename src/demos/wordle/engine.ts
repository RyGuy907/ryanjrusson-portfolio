/* Wordle solver engine — entropy and minimax agents.
   Patterns are base-3 integers (§5 card 04): digit i is 0 gray / 1 yellow /
   2 green for position i, least-significant digit first. 3^5 = 243 patterns. */

export const ALL_GREEN = 242; // 22222 in base 3

/** Feedback for `guess` against `answer`, duplicate letters handled the way
    Wordle does: greens claim letters first, then yellows left to right. */
export function patternOf(guess: string, answer: string): number {
  const counts = new Array<number>(26).fill(0);
  const result = [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 2;
    } else {
      counts[answer.charCodeAt(i) - 97]++;
    }
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

export function filterCandidates(candidates: string[], guess: string, pattern: number): string[] {
  return candidates.filter((word) => patternOf(guess, word) === pattern);
}

export type ScoredGuess = {
  word: string;
  /** Expected information gain in bits (entropy agent). */
  bits: number;
  /** Size of the largest surviving candidate bucket (minimax agent). */
  worstCase: number;
  /** Whether the guess could itself be the answer. */
  isCandidate: boolean;
};

/** Score every guess against the remaining candidates: entropy of the
    feedback-pattern distribution, and worst-case bucket size. One pass
    serves both agents. */
export function scoreGuesses(guesses: string[], candidates: string[]): ScoredGuess[] {
  const candidateSet = new Set(candidates);
  const n = candidates.length;
  const histogram = new Uint16Array(243);

  return guesses.map((word) => {
    histogram.fill(0);
    for (const answer of candidates) {
      histogram[patternOf(word, answer)]++;
    }

    let bits = 0;
    let worstCase = 0;
    for (let p = 0; p < 243; p++) {
      const count = histogram[p];
      if (count === 0) continue;
      // An all-green "bucket" ends the game rather than leaving candidates.
      if (p !== ALL_GREEN && count > worstCase) worstCase = count;
      const prob = count / n;
      bits -= prob * Math.log2(prob);
    }

    return { word, bits, worstCase, isCandidate: candidateSet.has(word) };
  });
}

/** Entropy agent: maximize expected information gain. Ties break toward
    words that could be the answer (a free shot at winning). */
export function rankByEntropy(scored: ScoredGuess[]): ScoredGuess[] {
  return [...scored].sort(
    (a, b) =>
      b.bits - a.bits ||
      Number(b.isCandidate) - Number(a.isCandidate) ||
      a.worstCase - b.worstCase
  );
}

/** Minimax agent: minimize the worst-case surviving candidate set, assuming
    an adversarial word-chooser. Ties break toward candidate words, then
    toward higher expected information. */
export function rankByMinimax(scored: ScoredGuess[]): ScoredGuess[] {
  return [...scored].sort(
    (a, b) =>
      a.worstCase - b.worstCase ||
      Number(b.isCandidate) - Number(a.isCandidate) ||
      b.bits - a.bits
  );
}
