/* Opening-guess data, precomputed offline with scripts/compute-openers.mjs
   and committed as constants (§5 card 04: the first turn is the only
   expensive one, so it is the one we skip).

   Each agent opens with its own computed choice: the entropy agent picks
   SOARE, the risk-averse agent picks ARISE (four words tie at a worst case of
   168; ARISE is the first that is also a valid answer). */

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
  { word: 'arise', bits: 5.8209, worstCase: 168, isCandidate: true },
  { word: 'raise', bits: 5.8779, worstCase: 168, isCandidate: true },
  { word: 'aesir', bits: 5.622, worstCase: 168, isCandidate: false },
  { word: 'serai', bits: 5.5903, worstCase: 168, isCandidate: false },
  { word: 'reais', bits: 5.5859, worstCase: 168, isCandidate: false },
];
