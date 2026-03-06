import { MidSquareParams, MidSquareStep } from '../../types/simulation';

/**
 * Generador de numeros pseudoaleatorios por el Metodo de Cuadrados Medios.
 * @param params Objeto contenedor con la semilla inicial (X0) y el numero de iteraciones (n).
 * @returns Un arreglo de objetos detallando cada paso iterativo.
 */
export function generateMidSquares(params: MidSquareParams): MidSquareStep[] {
  const { seed, count } = params;
  const results: MidSquareStep[] = [];
  
  // Determinacion de la longitud 'd' para la extraccion de digitos
  const seedString = seed.toString();
  const d = seedString.length;
  
  if (d < 3) {
    throw new Error('La semilla debe contener al menos 3 dígitos para resultados estadísticamente válidos.');
  }

  let currentXi = seed;

  for (let i = 1; i <= count; i++) {
    // Elevacion al cuadrado de la semilla
    const squared = Math.pow(currentXi, 2);
    let squaredStr = squared.toString();

    // Relleno de ceros a la izquierda para mantener la simetria (2d)
    const targetLength = d * 2;
    while (squaredStr.length < targetLength) {
      squaredStr = '0' + squaredStr;
    }

    // Extraccion de los digitos centrales
    const startIndex = Math.floor((squaredStr.length - d) / 2);
    const middleDigitsStr = squaredStr.substring(startIndex, startIndex + d);
    
    // Generacion del nuevo valor y el numero pseudoaleatorio normalizado
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
    
    // Condicion de parada si la semilla degenera a cero
    if (currentXi === 0) break;
  }

  return results;
}