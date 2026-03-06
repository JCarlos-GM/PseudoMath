// Z_{α/2} para los niveles de confianza estándar
const Z_TABLE: Record<string, number> = {
  '0.01': 2.576,
  '0.05': 1.96,
  '0.10': 1.645,
};

export interface MeansResult {
  passed: boolean;
  mean: number;
  sqrtFactor: number;
  lowerLimit: number;
  upperLimit: number;
  n: number;
  z: number;
  alpha: number;
}

/**
 * Prueba de Medias.
 * Criterio: L_I ≤ r̄ ≤ L_S
 * donde L_I = 0.5 - Z_{α/2}/√(12n)  y  L_S = 0.5 + Z_{α/2}/√(12n)
 */
export function testMeans(ri: number[], alpha: number): MeansResult {
  const n = ri.length;
  const z = Z_TABLE[alpha.toFixed(2)] ?? 1.96;

  const mean = ri.reduce((sum, r) => sum + r, 0) / n;
  const sqrtFactor = Math.sqrt(12 * n);
  const lowerLimit = 0.5 - z / sqrtFactor;
  const upperLimit = 0.5 + z / sqrtFactor;

  return {
    passed: mean >= lowerLimit && mean <= upperLimit,
    mean,
    sqrtFactor,
    lowerLimit,
    upperLimit,
    n,
    z,
    alpha,
  };
}
