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
 * M = √N como flotante, df = floor(M) − 1. Criterio: χ²_c ≤ χ²_{α, df}
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
    const upper = i === mInt - 1 ? 1 : (i + 1) * rango;

    const observed = ri.filter(r => r >= lower && r < upper).length;
    const contribution = (expected - observed) ** 2 / expected;

    bins.push({ index: i + 1, lower, upper, observed, expected, contribution });
  }

  // Valores exactamente 1.0 quedan en el último bin con r <= 1
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
