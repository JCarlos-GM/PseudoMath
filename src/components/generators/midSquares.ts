import { MidSquareParams, MidSquareStep } from '../../types/simulation';

/**
 * Generador de numeros pseudoaleatorios por el Metodo de Cuadrados Medios.
 * * @param params Objeto contenedor con la semilla inicial (X0) y el numero de iteraciones (n).
 * @returns Un arreglo de objetos detallando cada paso iterativo, util para renderizado didactico.
 */
export function generateMidSquares(params: MidSquareParams): MidSquareStep[] {
  const { seed, count } = params;
  const results: MidSquareStep[] = [];
  
  // La longitud de la semilla determina cuantos digitos centrales se deben extraer
  const seedString = seed.toString();
  const d = seedString.length;
  
  // Validacion de restriccion teorica: La semilla debe tener mas de 3 digitos
  if (d < 3) {
    throw new Error('La semilla debe contener al menos 3 dígitos para resultados estadísticamente válidos.');
  }

  let currentXi = seed;

  for (let i = 1; i <= count; i++) {
    // 1. Elevar al cuadrado la semilla actual (Yi)
    const squared = Math.pow(currentXi, 2);
    let squaredStr = squared.toString();

    // 2. Formatear la cadena para garantizar la simetria (agregar ceros a la izquierda si es necesario)
    // El cuadrado debe tener longitud 2d o 2d-1 para extraer d digitos centrales correctamente.
    const targetLength = d * 2;
    while (squaredStr.length < targetLength) {
      squaredStr = '0' + squaredStr;
    }

    // 3. Calcular indices para la extraccion de los 'd' digitos centrales
    const startIndex = Math.floor((squaredStr.length - d) / 2);
    const middleDigitsStr = squaredStr.substring(startIndex, startIndex + d);
    
    // 4. Convertir los digitos extraidos al nuevo valor X_{i+1}
    const nextXi = parseInt(middleDigitsStr, 10);
    
    // 5. Calcular el numero pseudoaleatorio normalizado r_i entre (0, 1)
    const ri = nextXi / Math.pow(10, d);

    // Almacenar registro iterativo estructurado
    results.push({
      iteration: i,
      seed: currentXi,
      squared: squared,
      paddedString: squaredStr,
      middleDigits: middleDigitsStr,
      value: ri
    });

    // Preparar variable para la siguiente iteracion
    currentXi = nextXi;
    
    // Condicion de parada temprana (Degeneracion del generador a 0)
    if (currentXi === 0) break;
  }

  return results;
}