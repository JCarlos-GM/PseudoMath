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
  seed: number; // Semilla (X0) — Beta
  alfa: number; // Constante multiplicadora — Alfa
  count: number;
}

export interface MidProductParams {
  seed: number;
  alfa: number;
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
  alfa: number;         // constante multiplicadora (Alfa)
  product: number;      // Alfa × Xᵢ
  paddedString: string; // producto rellenado a 2d dígitos
  largo: number;        // longitud = 2d
  middleDigits: string; // d dígitos centrales del producto
}

// ==========================================
// 4. Monte Carlo (Congruencial Lineal)
// ==========================================

export interface MonteCarloParams {
  seed:  number; // X₀ — semilla inicial (cualquier entero positivo)
  a:     number; // multiplicador (número impar)
  c:     number; // incremento   (no cuadrado perfecto)
  b:     number; // módulo       (potencia de 2 recomendada)
  count: number;
}

export interface MonteCarloStep extends GeneratedNumber {
  // seed      = Xₙ  (el valor x de esta fila)
  // value     = Rᵢ  = Xₙ / b
  // isSeedRow = true para n=1 (la semilla, "No vale")
  isSeedRow: boolean;
  a: number;
  c: number;
  b: number;
}

// ==========================================
// 5. Historial de Simulaciones
// ==========================================

export interface HistoryEntry {
  id:         string;
  method:     string;               // 'midSquares' | 'multiplicative' | 'monteCarlo'
  seed:       number;               // X₀ de la simulación
  params:     Record<string, number>; // todos los parámetros usados (count, alfa, a, c, b…)
  validCount: number;               // Rᵢ únicos (sin duplicados)
  totalCount: number;               // iteraciones generadas (sin fila semilla)
  timestamp:  number;               // Date.now()
}