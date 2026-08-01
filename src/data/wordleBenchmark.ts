/* Benchmark results for /work/wordle, from scripts/benchmark.mjs over all
   2,315 answers with the full 12,972-word guess pool. Each agent opens with
   its own computed opener (entropy SOARE, risk-averse ARISE) rather than a
   shared hardcoded word. Human baseline (5 games) lives in the deep-dive
   prose — too few games for an honest chart series. */

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
    counts: { 1: 0, 2: 31, 3: 1105, 4: 1111, 5: 67, 6: 1 },
    average: 3.53,
    worst: 6,
  },
  {
    id: 'minimax',
    label: 'Minimax',
    counts: { 1: 1, 2: 38, 3: 938, 4: 1258, 5: 80, 6: 0 },
    average: 3.6,
    worst: 5,
  },
];
