/** Aproximación de Lanczos para log-gamma */
function logGamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6,
  ];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/** Gamma incompleta regularizada P(a,x) vía serie */
function gammaIncSeries(a: number, x: number): number {
  let ap = a, del = 1 / a, sum = del;
  for (let n = 1; n <= 300; n++) {
    ap++; del *= x / ap; sum += del;
    if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Gamma incompleta regularizada vía fracción continua (x grande) */
function gammaIncCF(a: number, x: number): number {
  const FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

function gammaInc(a: number, x: number): number {
  if (x <= 0 || a <= 0) return 0;
  return x < a + 1 ? gammaIncSeries(a, x) : gammaIncCF(a, x);
}

/** PDF de chi-cuadrada f(x; df) */
export function chiSquarePDF(x: number, df: number): number {
  if (x <= 0) return 0;
  return Math.exp(
    (df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - logGamma(df / 2),
  );
}

/** CDF de chi-cuadrada P(X ≤ x | df) */
function chiSquareCDF(x: number, df: number): number {
  return gammaInc(df / 2, x / 2);
}

/** Cuantil de la distribución normal estándar (Acklam 2003). Equivale a NORM.S.INV. */
function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return  Infinity;

  const a = [
    -3.969683028665376e+01,  2.209460984245205e+02,
    -2.759285104469687e+02,  1.383577518672690e+02,
    -3.066479806614716e+01,  2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01,  1.615858368580409e+02,
    -1.556989798598866e+02,  6.680131188771972e+01,
    -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
     4.374664141464968e+00,  2.938163982698783e+00,
  ];
  const d = [
     7.784695709041462e-03,  3.224671290700398e-01,
     2.445134137142996e+00,  3.754408661907416e+00,
  ];

  const pLow = 0.02425;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if (p > 1 - pLow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
              ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
         (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

/** Inversa de la CDF chi-cuadrada. Coincide con CHISQ.INV(p, df) de Excel. */
export function chiSquareInv(p: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;

  const z = normalQuantile(p);
  const h = 2 / (9 * df);
  let x = Math.max(1e-4, df * Math.pow(Math.max(1e-10, 1 - h + z * Math.sqrt(h)), 3));

  for (let i = 0; i < 60; i++) {
    if (!isFinite(x) || x <= 0) { x = df; continue; }
    const fx  = chiSquareCDF(x, df) - p;
    if (Math.abs(fx) < 1e-12) break;
    const pdf = chiSquarePDF(x, df);
    if (pdf < 1e-280) break;
    const xNew = x - fx / pdf;
    x = (!isFinite(xNew) || xNew <= 0) ? x / 2 : xNew;
  }
  return x;
}

export interface VarianceResult {
  passed: boolean;
  sampleVariance: number; // S²  (VAR.S, divide entre N−1)
  testStatistic:  number; // T = 12·(N−1)·S²
  chiSqLower:     number; // χ²(α/2, N−1)   — "Coe sup" en Excel ≈ 29.16
  chiSqUpper:     number; // χ²(1−α/2, N−1) — "Coe inf" en Excel ≈ 66.62
  lowerLimit:     number; // LS (INF) = chiSqLower / (12·(N−1))
  upperLimit:     number; // LI (SUP) = chiSqUpper / (12·(N−1))
  n:     number;
  df:    number; // N−1
  alpha: number;
}

/**
 * Prueba de Varianza (dos colas, distribución χ²).
 * Criterio: LS ≤ S² ≤ LI
 * donde LS = χ²(α/2, N−1) / (12·(N−1))  y  LI = χ²(1−α/2, N−1) / (12·(N−1))
 */
export function testVariance(ri: number[], alpha: number): VarianceResult {
  const n    = ri.length;
  const df   = n - 1;
  const mean = ri.reduce((s, r) => s + r, 0) / n;

  const sampleVariance = ri.reduce((s, r) => s + (r - mean) ** 2, 0) / df;
  const testStatistic = 12 * df * sampleVariance;

  const chiSqLower = chiSquareInv(alpha / 2,     df);
  const chiSqUpper = chiSquareInv(1 - alpha / 2, df);

  const lowerLimit = chiSqLower / (12 * df);
  const upperLimit = chiSqUpper / (12 * df);

  return {
    passed: sampleVariance >= lowerLimit && sampleVariance <= upperLimit,
    sampleVariance,
    testStatistic,
    chiSqLower,
    chiSqUpper,
    lowerLimit,
    upperLimit,
    n,
    df,
    alpha,
  };
}
