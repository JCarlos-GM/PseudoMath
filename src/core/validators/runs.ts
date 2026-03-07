// Z_{α/2} para los niveles de confianza estándar (mismo que Prueba de Medias)
const Z_TABLE: Record<string, number> = {
  '0.01': 2.576,
  '0.05': 1.96,
  '0.10': 1.645,
};

// ── Interfaces ────────────────────────────────────────────────

export interface RunsRow {
  i:    number; // índice 1-based (fila del número original)
  ri:   number; // valor Rᵢ
  sign: 0 | 1 | null; // 1 si rᵢ < rᵢ₊₁, 0 si rᵢ > rᵢ₊₁, null para el último
  run:  number | null; // número de corrida acumulada hasta esta fila (null = último Rᵢ)
}

export interface RunsResult {
  passed:       boolean;
  n:            number;   // cantidad de números originales
  alpha:        number;
  signs:        (0 | 1)[]; // N-1 signos
  totalRuns:    number;   // R — corridas contadas correctamente
  expectedRuns: number;   // E(R) = (2N-1)/3
  varianceRuns: number;   // V(R) = (16N-29)/90
  zCalc:        number;   // |R - E(R)| / sqrt(V(R))
  zCritical:    number;   // Z_{α/2}
  rows:         RunsRow[];
}

/**
 * Prueba de Corridas (Runs Test) para independencia.
 *
 * Genera N-1 signos (no N como hace Excel por bug de celda vacía).
 * Criterio: Z_calc ≤ Z_crítico
 *
 * Fórmulas:
 *   E(R) = (2N - 1) / 3
 *   V(R) = (16N - 29) / 90
 *   Z    = |R - E(R)| / √V(R)
 */
export function testRuns(ri: number[], alpha: number): RunsResult {
  const n = ri.length;

  // Paso 1: generar N-1 signos
  const signs: (0 | 1)[] = [];
  for (let i = 0; i < n - 1; i++) {
    signs.push(ri[i] < ri[i + 1] ? 1 : 0);
  }

  // Paso 2: contar corridas
  // Una corrida es una racha ininterrumpida de signos iguales.
  // Iniciamos en 1 porque el primer signo ya forma la primera corrida.
  let totalRuns = signs.length > 0 ? 1 : 0;
  for (let i = 1; i < signs.length; i++) {
    if (signs[i] !== signs[i - 1]) totalRuns++;
  }

  // Paso 3: construir filas para la tabla (N filas, la última sin signo ni corrida)
  const rows: RunsRow[] = ri.map((r, idx) => {
    const isLast = idx === n - 1;
    // corrida acumulada: contar cambios hasta esta posición
    let runAt: number | null = null;
    if (!isLast) {
      runAt = 1;
      for (let j = 1; j <= idx; j++) {
        if (signs[j] !== signs[j - 1]) runAt++;
      }
    }
    return {
      i:    idx + 1,
      ri:   r,
      sign: isLast ? null : signs[idx],
      run:  runAt,
    };
  });

  // Paso 4: estadísticos
  const expectedRuns = (2 * n - 1) / 3;
  const varianceRuns = (16 * n - 29) / 90;
  const zCalc        = Math.abs(totalRuns - expectedRuns) / Math.sqrt(varianceRuns);
  const zCritical    = Z_TABLE[alpha.toFixed(2)] ?? 1.96;

  return {
    passed: zCalc <= zCritical,
    n,
    alpha,
    signs,
    totalRuns,
    expectedRuns,
    varianceRuns,
    zCalc,
    zCritical,
    rows,
  };
}
