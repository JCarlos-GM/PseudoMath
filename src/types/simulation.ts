// ==========================================
// 1. Tipos Generales y Resultados Base
// ==========================================

export interface GeneratedNumber {
  iteration: number;
  value: number; // El número pseudoaleatorio entre 0 y 1 (ri)
  seed: number;  // La semilla usada en este paso (Xi)
}

export interface ValidationResult {
  passed: boolean;
  testName: string;
  statistic: number;     // El valor calculado en la prueba (ej. Z0, Chi-Cuadrada calculada)
  criticalValue: number; // El valor de las tablas estadísticas
  alpha: number;         // Nivel de significancia (ej. 0.05)
  details?: any;         // Datos extra para renderizar tablas o gráficas (frecuencias, etc.)
}

// ==========================================
// 2. Parámetros de los Generadores
// ==========================================

export interface MidSquareParams {
  seed: number; // Semilla (X0) - usualmente de 4 dígitos
  count: number; // Cantidad de números a generar
}

export interface MultiplicativeParams {
  seed: number; // Semilla (X0)
  a: number;    // Multiplicador
  m: number;    // Módulo
  count: number;
}

// ==========================================
// 3. Respuestas de los Generadores (Paso a Paso)
// ==========================================

export interface MidSquareStep extends GeneratedNumber {
  squared: number;        // El cuadrado de la semilla
  paddedString: string;   // El número rellenado con ceros (para visualización didáctica)
  middleDigits: string;   // Los dígitos centrales extraídos
}

export interface MultiplicativeStep extends GeneratedNumber {
  ax: number;      // a * Xi
  modResult: number; // (a * Xi) mod m
}