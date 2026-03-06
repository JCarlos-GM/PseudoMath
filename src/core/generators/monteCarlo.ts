import type { MonteCarloParams, MonteCarloStep } from '../../types/simulation';

/**
 * Generador de números pseudoaleatorios por el Método de Monte Carlo (Congruencial Lineal).
 *
 * Formato idéntico al Excel de referencia:
 *   Fila 1 : x = semilla (X₀),  Ri = X₀/b  → "No vale"
 *   Fila n+1: x = Xₙ = (a·Xₙ₋₁ + c) mod b, Ri = Xₙ/b
 *
 * Usa BigInt para la multiplicación a·Xₙ que puede superar Number.MAX_SAFE_INTEGER.
 */
export function generateMonteCarlo(params: MonteCarloParams): MonteCarloStep[] {
  const { seed, a, c, b, count } = params;

  const results: MonteCarloStep[] = [];
  const bigA = BigInt(a);
  const bigC = BigInt(c);
  const bigB = BigInt(b);

  // Fila 1: la semilla misma (No vale)
  results.push({
    iteration: 1,
    seed:      seed,
    value:     seed / b,
    isSeedRow: true,
    a, c, b,
  });

  let currentX = seed;
  for (let i = 1; i <= count; i++) {
    const xNext = Number((bigA * BigInt(currentX) + bigC) % bigB);

    results.push({
      iteration: i + 1,
      seed:      xNext,   // Xₙ es el valor de "x" en esta fila
      value:     xNext / b,
      isSeedRow: false,
      a, c, b,
    });

    currentX = xNext;
    if (currentX === 0) break;
  }

  return results;
}
