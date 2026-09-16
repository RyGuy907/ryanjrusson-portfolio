/* Benchmark results for /work/wordle, from scripts/benchmark.mjs over all
   2,315 answers with the full 12,972-word guess pool. Each agent opens with
   its own computed opener (entropy SOARE, risk-averse RAISE) rather than a
   shared hardcoded word. The Python project these agents were ported from
   returns the same guess count for every one of the 2,315 words. Human
   baseline (5 games) lives in the deep-dive prose — too few games for an
   honest chart series. */

export type BenchmarkSeries = {
  id: string;
  label: string;
  /** counts[k] = number of games solved in k guesses, index 1-6. */
  counts: Record<number, number>;
  average: number;
  worst: number;
};

export const TOTAL_GAMES = 2315;

export const benchmark: BenchmarkSeries[] = [
  {
    id: 'entropy',
    label: 'Entropy',
    counts: { 1: 0, 2: 44, 3: 1217, 4: 990, 5: 63, 6: 1 },
    average: 3.46,
    worst: 6,
  },
  {
    id: 'minimax',
    label: 'Minimax',
    counts: { 1: 1, 2: 67, 3: 1045, 4: 1129, 5: 73, 6: 0 },
    average: 3.52,
    worst: 5,
  },
];
