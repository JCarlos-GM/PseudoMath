import type { MonteCarloParams, MonteCarloStep } from '../../types/simulation';

export function generateMonteCarlo(params: MonteCarloParams): MonteCarloStep[] {
  const { seed, a, c, b, count } = params;

  const results: MonteCarloStep[] = [];

  // Fila 1: la semilla misma
  results.push({
    iteration: 1,
    seed:      seed,
    value:     seed / b,
    isSeedRow: true,
    a, c, b,
  });

  let currentX = seed;
  for (let i = 1; i <= count; i++) {
    // Usamos Number de forma intencional para replicar el límite 
    // de precisión de punto flotante de Excel (IEEE 754).
    const xNext = (a * currentX + c) % b;

    results.push({
      iteration: i + 1,
      seed:      xNext,
      value:     xNext / b,
      isSeedRow: false,
      a, c, b,
    });

    currentX = xNext;
  }

  return results;
}