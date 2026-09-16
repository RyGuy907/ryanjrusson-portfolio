/* Opening-guess data, computed offline with scripts/compute-openers.mjs and
   committed as constants. Every game starts from the same 2,315 candidates,
   so the first guess is always the same, and it's the only expensive one to
   compute. Doing it live would cost seconds to get the same word each time.

   Each agent opens with its own computed choice: the entropy agent picks
   SOARE, the risk-averse agent picks RAISE. Five words tie at a worst case of
   168, two of which are possible answers; RAISE wins because it carries the
   most information of those. */

import type { ScoredGuess } from './engine';

/** Entropy agent's opener ranking: maximum expected information gain. */
export const ENTROPY_OPENER: ScoredGuess[] = [
  { word: 'soare', bits: 5.886, worstCase: 183, isCandidate: false },
  { word: 'roate', bits: 5.8828, worstCase: 195, isCandidate: false },
  { word: 'raise', bits: 5.8779, worstCase: 168, isCandidate: true },
  { word: 'raile', bits: 5.8657, worstCase: 173, isCandidate: false },
  { word: 'reast', bits: 5.8655, worstCase: 227, isCandidate: false },
];

/** Risk-averse agent's opener ranking: smallest worst-case bucket. */
export const MINIMAX_OPENER: ScoredGuess[] = [
  { word: 'raise', bits: 5.8779, worstCase: 168, isCandidate: true },
  { word: 'arise', bits: 5.8209, worstCase: 168, isCandidate: true },
  { word: 'aesir', bits: 5.622, worstCase: 168, isCandidate: false },
  { word: 'serai', bits: 5.5903, worstCase: 168, isCandidate: false },
  { word: 'reais', bits: 5.5859, worstCase: 168, isCandidate: false },
];
