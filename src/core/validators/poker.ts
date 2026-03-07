import { chiSquareInv } from './variance';

export type PokerCategory = 'TD' | '1P' | '2P' | 'T' | 'TP' | 'P' | 'Q';

// Probabilidades teóricas para 5 dígitos decimales (0-9)
const PROBABILITIES: Record<PokerCategory, number> = {
  TD:  0.3024,
  '1P': 0.5040,
  '2P': 0.1080,
  T:    0.0720,
  TP:   0.0090,
  P:    0.0045,
  Q:    0.0001,
};

const CATEGORY_LABELS: Record<PokerCategory, string> = {
  TD:  'Todos Diferentes',
  '1P': 'Un Par',
  '2P': 'Dos Pares',
  T:    'Tercia',
  TP:   'Tercia y Par (Full)',
  P:    'Poker (Cuatro iguales)',
  Q:    'Quintilla',
};

const CATEGORY_ORDER: PokerCategory[] = ['TD', '1P', '2P', 'T', 'TP', 'P', 'Q'];

// ── Clasificación de mano ─────────────────────────────────────

function classifyHand(digits: string): PokerCategory {
  const freq: Record<string, number> = {};
  for (const d of digits) freq[d] = (freq[d] ?? 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);

  if (counts[0] === 5) return 'Q';
  if (counts[0] === 4) return 'P';
  if (counts[0] === 3 && counts[1] === 2) return 'TP';
  if (counts[0] === 3) return 'T';
  if (counts[0] === 2 && counts[1] === 2) return '2P';
  if (counts[0] === 2) return '1P';
  return 'TD';
}

export interface PokerHandDetail {
  ri:       number;
  digits:   string;   // 5 dígitos redondeados (ej. "25233")
  category: PokerCategory;
}

export interface PokerRow {
  category:    PokerCategory;
  label:       string;
  probability: number; // Pᵢ teórica
  observed:    number; // Oᵢ
  expected:    number; // Eᵢ = N × Pᵢ
  contribution: number; // (Eᵢ−Oᵢ)²/Eᵢ
}

export interface PokerResult {
  passed:      boolean;
  n:           number;
  alpha:       number;
  df:          number; // siempre 6
  rows:        PokerRow[];
  details:     PokerHandDetail[];
  chiCalc:     number;
  chiCritical: number;
}

/**
 * Prueba de Póker para uniformidad.
 * Clasifica los 5 dígitos decimales de cada Rᵢ en 7 categorías, df = 6.
 * Criterio: χ²c ≤ χ²_{α, 6}
 */
export function testPoker(ri: number[], alpha: number): PokerResult {
  const n  = ri.length;
  const df = 6;

  // Paso 1 & 2: clasificar cada número usando toFixed(5)
  const details: PokerHandDetail[] = ri.map((r) => {
    const fixed  = r.toFixed(5);                              // "0.25233"
    const dotIdx = fixed.indexOf('.');
    const d5     = fixed.slice(dotIdx + 1, dotIdx + 6);      // "25233"
    return { ri: r, digits: d5, category: classifyHand(d5) };
  });

  const observed: Record<PokerCategory, number> = {
    TD: 0, '1P': 0, '2P': 0, T: 0, TP: 0, P: 0, Q: 0,
  };
  for (const d of details) observed[d.category]++;

  const rows: PokerRow[] = CATEGORY_ORDER.map((cat) => {
    const prob  = PROBABILITIES[cat];
    const ei    = n * prob;
    const oi    = observed[cat];
    const contribution = ei > 0 ? (ei - oi) ** 2 / ei : 0;
    return { category: cat, label: CATEGORY_LABELS[cat], probability: prob, observed: oi, expected: ei, contribution };
  });

  const chiCalc     = rows.reduce((s, r) => s + r.contribution, 0);
  const chiCritical = chiSquareInv(1 - alpha, df);

  return { passed: chiCalc <= chiCritical, n, alpha, df, rows, details, chiCalc, chiCritical };
}
