import type { MidSquareParams, MidSquareStep } from '../../types/simulation';

/**
 * Generador de números pseudoaleatorios por el Método de Cuadrados Medios.
 * @param params Objeto con la semilla (seed) y cantidad de iteraciones (count).
 */
export function generateMidSquares(params: MidSquareParams): MidSquareStep[] {
  const { seed, count } = params;
  const results: MidSquareStep[] = [];
  
  const seedString = seed.toString();
  const d = seedString.length;
  
  if (d < 3) {
    throw new Error('La semilla debe contener al menos 3 dígitos.');
  }

  let currentXi = seed;

  for (let i = 1; i <= count; i++) {
    const squared = Math.pow(currentXi, 2);
    let squaredStr = squared.toString();

    // Relleno simétrico a 2d
    const targetLength = d * 2;
    while (squaredStr.length < targetLength) {
      squaredStr = '0' + squaredStr;
    }

    // Extracción de dígitos centrales
    const startIndex = Math.floor((squaredStr.length - d) / 2);
    const middleDigitsStr = squaredStr.substring(startIndex, startIndex + d);
    
    const nextXi = parseInt(middleDigitsStr, 10);
    const ri = nextXi / Math.pow(10, d);

    results.push({
      iteration: i,
      seed: currentXi,
      squared: squared,
      paddedString: squaredStr,
      middleDigits: middleDigitsStr,
      value: ri
    });

    currentXi = nextXi;
    
    if (currentXi === 0) break;
  }

  return results;
}