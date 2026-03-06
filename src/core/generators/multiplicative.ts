import type { MultiplicativeParams, MultiplicativeStep } from '../../types/simulation';

/**
 * Generador de números pseudoaleatorios por el Método Multiplicativo (Productos Medios).
 * Algoritmo: se multiplica la constante Alfa por la semilla Xᵢ,
 * se rellena el producto a 2d dígitos y se extraen los d dígitos centrales.
 *
 * @param params { alfa, seed (X₀), count }
 */
export function generateMultiplicative(params: MultiplicativeParams): MultiplicativeStep[] {
  const { alfa, seed, count } = params;

  const d = 4; // siempre 4 dígitos (ambos parámetros son de 4 dígitos)
  const targetLength = d * 2; // largo = 2d = 8

  const results: MultiplicativeStep[] = [];
  let currentXi = seed;

  for (let i = 1; i <= count; i++) {
    const product = alfa * currentXi;
    let productStr = product.toString();

    // Rellenar con ceros a la izquierda hasta 2d dígitos
    while (productStr.length < targetLength) {
      productStr = '0' + productStr;
    }

    // Extraer d dígitos centrales
    const startIndex = Math.floor((productStr.length - d) / 2);
    const middleDigitsStr = productStr.substring(startIndex, startIndex + d);

    const nextXi = parseInt(middleDigitsStr, 10);
    const ri = nextXi / Math.pow(10, d);

    results.push({
      iteration:    i,
      seed:         currentXi,
      alfa:         alfa,
      product:      product,
      paddedString: productStr,
      largo:        targetLength,
      middleDigits: middleDigitsStr,
      value:        ri,
    });

    currentXi = nextXi;
    if (currentXi === 0) break;
  }

  return results;
}
