import { chiSquareInv } from './variance';

export interface ChiSquareBin {
  index:       number; // 1-based
  lower:       number; // límite inferior del intervalo
  upper:       number; // límite superior del intervalo
  observed:    number; // Oᵢ — frecuencia observada
  expected:    number; // Eᵢ = N/M — frecuencia esperada
  contribution: number; // (Eᵢ − Oᵢ)² / Eᵢ
}

export interface ChiSquareGoFResult {
  passed:        boolean;
  n:             number; // cantidad de números
  mFloat:        number; // M = √N (exacto, como en Excel)
  mInt:          number; // Math.floor(M) — número de intervalos
  rango:         number; // 1 / M  (ancho de cada intervalo)
  expected:      number; // E = N / M (igual para todos los intervalos)
  bins:          ChiSquareBin[];
  chiCalc:       number; // χ²_c = Σ (Eᵢ−Oᵢ)²/Eᵢ
  chiCritical:   number; // χ²_{α, df} = CHISQ.INV(1−α, df)
  df:            number; // M_int − 1
  alpha:         number;
}

/**
 * Prueba Chi-Cuadrada de Bondad de Ajuste (uniformidad).
 * Criterio: χ²_c ≤ χ²_{α, M−1}
 *
 * Replica exactamente el procedimiento de Excel:
 *  • M = √N  (flotante exacto, igual que Excel)
 *  • Rango = 1 / M
 *  • Eᵢ = N / M  (mismo para todos los intervalos)
 *  • df = Math.floor(M) − 1
 *  • Valor tabla = CHISQ.INV(1−α, df)  ↔  chiSquareInv(1−α, df)
 */
export function testChiSquare(ri: number[], alpha: number): ChiSquareGoFResult {
  const n      = ri.length;
  const mFloat = Math.sqrt(n);
  const mInt   = Math.floor(mFloat);
  const rango  = 1 / mFloat;
  const expected = n / mFloat; // Eᵢ (mismo para todos)
  const df     = mInt - 1;

  // Construir bins
  const bins: ChiSquareBin[] = [];
  for (let i = 0; i < mInt; i++) {
    const lower = i * rango;
    // El último intervalo incluye el extremo superior 1 (por punto flotante)
    const upper = i === mInt - 1 ? 1 : (i + 1) * rango;

    const observed = ri.filter(r => r >= lower && r < upper).length;
    const contribution = (expected - observed) ** 2 / expected;

    bins.push({ index: i + 1, lower, upper, observed, expected, contribution });
  }

  // Asegurarse de que cualquier Ri = 1.0 exacto quede en el último bin
  // (el filter con r < upper del último bin excluiría 1.0, pero upper = 1 allí,
  //  así que r < 1 fallaría — lo corregimos con >= lower && <= 1 en el último bin)
  if (mInt > 0) {
    const lastBin = bins[mInt - 1];
    const lastCount = ri.filter(r => r >= lastBin.lower && r <= 1).length;
    if (lastCount !== lastBin.observed) {
      lastBin.observed     = lastCount;
      lastBin.contribution = (expected - lastCount) ** 2 / expected;
    }
  }

  const chiCalc    = bins.reduce((s, b) => s + b.contribution, 0);
  const chiCritical = chiSquareInv(1 - alpha, df);

  return {
    passed: chiCalc <= chiCritical,
    n,
    mFloat,
    mInt,
    rango,
    expected,
    bins,
    chiCalc,
    chiCritical,
    df,
    alpha,
  };
}
