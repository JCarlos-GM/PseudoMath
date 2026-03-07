# PseudoMath

Laboratorio interactivo para la generación y validación estadística de números pseudoaleatorios. Desarrollado con React 19 + TypeScript + Vite 7.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Uso](#instalación-y-uso)
- [Rutas de la Aplicación](#rutas-de-la-aplicación)
- [Módulo: Generadores](#módulo-generadores)
  - [Cuadrados Medios](#cuadrados-medios)
  - [Método Multiplicativo](#método-multiplicativo)
  - [Monte Carlo (Congruencial Lineal)](#monte-carlo-congruencial-lineal)
- [Módulo: Validadores](#módulo-validadores)
  - [Prueba de Medias](#prueba-de-medias)
  - [Prueba de Varianza](#prueba-de-varianza)
- [Estado Global](#estado-global-zustand)
- [Tipos TypeScript](#tipos-typescript)
- [Diseño y Estilos](#diseño-y-estilos)

---

## Descripción

PseudoMath permite generar secuencias de números pseudoaleatorios mediante distintos algoritmos clásicos, y luego validar estadísticamente esas secuencias con pruebas formales. Los resultados de cada generación se persisten en el historial (localStorage) para poder ser reutilizados en las pruebas de validación sin necesidad de regenerarlos.

---

## Stack Tecnológico

| Dependencia | Version | Uso |
|---|---|---|
| React | 19.x | UI principal |
| TypeScript | 5.9.x | Tipado estático |
| Vite | 7.x | Build tool + dev server |
| Tailwind CSS | 4.x | Estilos (via `@tailwindcss/vite`) |
| Zustand | 5.x | Estado global persistente |
| React Router DOM | 7.x | Ruteo con layout anidado |
| Recharts | 3.x | Graficas de distribucion y secuencia |
| KaTeX / react-katex | 0.16.x / 3.x | Formulas matematicas renderizadas |
| TanStack Table | 8.x | Tablas de datos |
| lucide-react | 0.577.x | Iconos |
| clsx + tailwind-merge | latest | Utilidades de clases CSS |

---

## Estructura del Proyecto

```
pseudomath/
├── public/
├── src/
│   ├── main.tsx                        # Punto de entrada React
│   ├── App.tsx                         # Router principal (rutas anidadas bajo MainLayout)
│   ├── index.css                       # Estilos globales + variables CSS (accent color)
│   ├── react-katex.d.ts                # Declaraciones de tipos para react-katex
│   │
│   ├── types/
│   │   └── simulation.ts               # Interfaces TypeScript centrales
│   │
│   ├── store/
│   │   └── useSimulationStore.ts       # Zustand store con persist (localStorage)
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── MainLayout.tsx          # Navbar + footer + <Outlet>
│   │       └── Footer.tsx              # Footer con links de contacto
│   │
│   ├── pages/
│   │   ├── Home.tsx                    # Landing con acceso a modulos
│   │   ├── Generators.tsx              # Laboratorio de generacion de pseudos
│   │   ├── Validators.tsx              # Validadores estadisticos con graficas
│   │   ├── Theory.tsx                  # Teoria de los metodos
│   │   └── Tools.tsx                   # Herramientas externas del ecosistema
│   │
│   └── core/
│       ├── utils.ts
│       ├── generators/
│       │   ├── midSquares.ts           # Metodo Cuadrados Medios
│       │   ├── multiplicative.ts       # Metodo Multiplicativo (Productos Medios)
│       │   └── monteCarlo.ts           # Metodo de Monte Carlo (Congruencial Lineal)
│       └── validators/
│           ├── means.ts                # Prueba de Medias
│           ├── variance.ts             # Prueba de Varianza (chi-cuadrada)
│           ├── chiSquare.ts            # (pendiente)
│           ├── poker.ts                # (pendiente)
│           └── runs.ts                 # (pendiente)
├── package.json
├── vite.config.ts
├── tsconfig.app.json
└── tsconfig.node.json
```

---

## Instalación y Uso

```bash
# Clonar el repositorio
git clone <url>
cd pseudomath

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de produccion
npm run build

# Preview del build
npm run preview
```

---

## Rutas de la Aplicación

| Ruta | Componente | Descripcion |
|---|---|---|
| `/` | `Home` | Pagina principal con acceso a modulos |
| `/generadores` | `Generators` | Laboratorio de generacion |
| `/validadores` | `Validators` | Pruebas estadisticas |
| `/teoria` | `Theory` | Teoria de los metodos |
| `/herramientas` | `Tools` | Herramientas externas |
| `/*` | — | Redirige a `/` |

---

## Módulo: Generadores

Ubicacion: `src/pages/Generators.tsx`

El laboratorio de generadores permite seleccionar un metodo, configurar sus parametros y generar una secuencia de numeros Ri ∈ [0, 1). Al generar, los resultados se guardan en el store global y se registra una entrada en el historial. El historial persiste entre sesiones via localStorage.

### Cuadrados Medios

**Archivo:** `src/core/generators/midSquares.ts`

**Algoritmo:**

1. Se toma la semilla `X₀` de `d` digitos.
2. Se eleva al cuadrado: `X₀²`
3. El cuadrado se rellena con ceros a la izquierda hasta tener `2d` digitos.
4. Se extraen los `d` digitos centrales → nuevo `Xᵢ`.
5. `Rᵢ = Xᵢ / 10^d`
6. Se repite desde el paso 2 usando `Xᵢ` como nueva semilla.

**Parametros:**

| Campo | Tipo | Descripcion |
|---|---|---|
| `seed` | `number` | Semilla inicial `X₀` (minimo 3 digitos) |
| `count` | `number` | Cantidad de iteraciones a generar |

**Condicion de paro:** Si `Xᵢ = 0`, la secuencia degenera y se detiene.

**Salida por paso (`MidSquareStep`):**

| Campo | Descripcion |
|---|---|
| `iteration` | Numero de iteracion (N) |
| `seed` | Valor `Xᵢ` usado en este paso |
| `squared` | `Xᵢ²` |
| `paddedString` | Representacion del cuadrado con relleno de ceros a `2d` digitos |
| `middleDigits` | Los `d` digitos centrales extraidos |
| `value` | `Rᵢ = Xᵢ₊₁ / 10^d` |

---

### Método Multiplicativo

**Archivo:** `src/core/generators/multiplicative.ts`

**Algoritmo:**

1. Se define una constante `Alfa` (multiplicador) y una semilla `X₀`, ambos de 4 digitos.
2. `producto = Alfa × Xᵢ`
3. El producto se rellena con ceros a la izquierda a `2d = 8` digitos.
4. Se extraen los `d = 4` digitos centrales → nuevo `Xᵢ`.
5. `Rᵢ = Xᵢ / 10^4`

**Parametros:**

| Campo | Tipo | Descripcion |
|---|---|---|
| `seed` | `number` | Semilla `X₀` (Beta) |
| `alfa` | `number` | Constante multiplicadora (Alfa) |
| `count` | `number` | Cantidad de iteraciones |

**Salida por paso (`MultiplicativeStep`):**

| Campo | Descripcion |
|---|---|
| `iteration` | Numero de iteracion |
| `seed` | `Xᵢ` actual |
| `alfa` | Constante Alfa usada |
| `product` | `Alfa × Xᵢ` |
| `paddedString` | Producto rellenado a `2d` digitos |
| `largo` | Longitud objetivo (`2d = 8`) |
| `middleDigits` | Los `d` digitos centrales |
| `value` | `Rᵢ` |

---

### Monte Carlo (Congruencial Lineal)

**Archivo:** `src/core/generators/monteCarlo.ts`

**Algoritmo (Congruencial Lineal Mixto):**

```
Xₙ₊₁ = (a · Xₙ + c) mod b
Rᵢ = Xₙ / b
```

La primera fila es la semilla misma y se marca como `isSeedRow = true` (no se usa para validacion estadistica).

**Parametros:**

| Campo | Tipo | Descripcion |
|---|---|---|
| `seed` | `number` | Semilla inicial `X₀` |
| `a` | `number` | Multiplicador (numero impar recomendado) |
| `c` | `number` | Incremento (no cuadrado perfecto recomendado) |
| `b` | `number` | Modulo (potencia de 2 recomendada) |
| `count` | `number` | Cantidad de numeros a generar (sin contar la fila semilla) |

**Salida por paso (`MonteCarloStep`):**

| Campo | Descripcion |
|---|---|
| `iteration` | Numero de fila |
| `seed` | Valor `Xₙ` de esta fila |
| `value` | `Rᵢ = Xₙ / b` |
| `isSeedRow` | `true` para la primera fila (semilla) |
| `a`, `c`, `b` | Parametros usados |

---

## Módulo: Validadores

Ubicacion: `src/pages/Validators.tsx`

El modulo de validadores recupera los numeros `Rᵢ` del store global o del historial, ejecuta la prueba estadistica seleccionada y presenta:

- Tabla de Rᵢ ordenada por N ascendente.
- Grafica de distribucion (campana de Gauss o chi-cuadrada segun la prueba).
- Grafica de secuencia de Rᵢ por N con banda de aceptacion.
- Estadisticas avanzadas (n, min, max, rango, varianza poblacional, varianza muestral, desviacion estandar, varianza teorica 1/12).
- Tarjetas con todos los parametros del calculo (equivalentes a los que muestra Excel).

Si no hay datos activos en el store, se ofrece el selector de historial para restaurar cualquier simulacion previa.

---

### Prueba de Medias

**Archivo:** `src/core/validators/means.ts`

**Hipotesis:** Los numeros son uniformemente distribuidos si su media se encuentra en el intervalo de aceptacion.

**Formulas:**

```
r̄ = (Σ Rᵢ) / n

LI = 0.5 - Z_{α/2} / √(12n)
LS = 0.5 + Z_{α/2} / √(12n)

Criterio: LI ≤ r̄ ≤ LS
```

**Valores criticos Z (tabla interna):**

| α | Z_{α/2} |
|---|---|
| 0.01 | 2.576 |
| 0.05 | 1.960 |
| 0.10 | 1.645 |

**Resultado (`MeansResult`):**

| Campo | Descripcion |
|---|---|
| `passed` | `true` si la media pasa la prueba |
| `mean` | Media muestral `r̄` |
| `sqrtFactor` | `√(12n)` |
| `lowerLimit` | Limite inferior `LI` |
| `upperLimit` | Limite superior `LS` |
| `n` | Cantidad de numeros |
| `z` | Valor `Z_{α/2}` usado |
| `alpha` | Nivel de significancia |

**Visualizacion:**
- Campana de Gauss con zona de aceptacion (verde) y rechazo (rojo) resaltadas.
- Linea vertical en la media `r̄`.
- Grafica de secuencia de Rᵢ por N.

---

### Prueba de Varianza

**Archivo:** `src/core/validators/variance.ts`

**Hipotesis:** Los numeros son uniformemente distribuidos si su varianza muestral se encuentra entre los limites derivados de la distribucion chi-cuadrada.

**Formulas:**

```
S² = Σ(Rᵢ - r̄)² / (N - 1)        [VAR.S — division entre N-1]

T  = 12 · (N-1) · S²               [estadistico de prueba]

χ²_sup = CHISQ.INV(α/2,   N-1)    [Coe sup en Excel]
χ²_inf = CHISQ.INV(1-α/2, N-1)    [Coe inf en Excel]

LS [INF] = χ²_sup / (12 · (N-1))
LI [SUP] = χ²_inf / (12 · (N-1))

Criterio: LS ≤ S² ≤ LI
```

> **Nota sobre la convencion de Excel:** Excel etiqueta el limite matematicamente superior como "LI" y el inferior como "LS", contrario a la intuicion. Las etiquetas `[SUP]` e `[INF]` en la UI aclaran el valor real de cada limite.

**Matematica interna (`variance.ts`):**

La funcion `chiSquareInv(p, df)` replica exactamente `CHISQ.INV(p, df)` de Excel mediante:

1. `logGamma(x)` — aproximacion de Lanczos para `ln(Γ(x))`.
2. `gammaIncSeries(a, x)` — gamma incompleta regularizada via serie (para `x < a+1`).
3. `gammaIncCF(a, x)` — gamma incompleta regularizada via fraccion continua (para `x ≥ a+1`).
4. `chiSquareCDF(x, df)` — `P(X ≤ x | df) = gammaInc(df/2, x/2)`.
5. `normalQuantile(p)` — cuantil normal estandar via aproximacion racional de Peter Acklam (error maximo ~1.15×10⁻⁹), equivale a `NORM.S.INV(p)` de Excel.
6. Estimacion inicial Wilson-Hilferty + refinamiento Newton-Raphson (converge en <10 iteraciones).

**Resultado (`VarianceResult`):**

| Campo | Descripcion |
|---|---|
| `passed` | `true` si la varianza pasa la prueba |
| `sampleVariance` | `S²` (VAR.S) |
| `testStatistic` | `T = 12·(N-1)·S²` |
| `chiSqLower` | `χ²(α/2, N-1)` — Coe sup |
| `chiSqUpper` | `χ²(1-α/2, N-1)` — Coe inf |
| `lowerLimit` | `LS [INF] = chiSqLower / (12·df)` |
| `upperLimit` | `LI [SUP] = chiSqUpper / (12·df)` |
| `n` | Cantidad de numeros |
| `df` | Grados de libertad `N-1` |
| `alpha` | Nivel de significancia |

**Parametros mostrados en UI (equivalentes a Excel):**

`α` | `α/2` | `1-α/2` | `Z ref.` | `N` | `Coe inf` | `Coe sup` | `S²` | `LI [SUP]` | `LS [INF]`

**Visualizacion:**
- Curva de densidad chi-cuadrada con zona de aceptacion resaltada.
- Marcadores en `χ²_sup` y `χ²_inf`.
- Grafica de secuencia de Rᵢ por N.

---

## Estado Global (Zustand)

**Archivo:** `src/store/useSimulationStore.ts`

El store usa el middleware `persist` de Zustand para guardar el estado en `localStorage` bajo la clave `pseudomath-simulation`. El historial y los datos de la ultima simulacion sobreviven recargas de pagina.

**Estado:**

```typescript
interface SimulationState {
  generatedNumbers: GeneratedNumber[]; // Numeros de la simulacion activa
  methodUsed: string | null;           // Nombre del metodo usado
  isSimulationActive: boolean;
  history: HistoryEntry[];             // Historial de todas las simulaciones
}
```

**Acciones:**

| Accion | Descripcion |
|---|---|
| `setSimulationData(numbers, method)` | Guarda los resultados de una generacion |
| `clearSimulation()` | Limpia la simulacion activa |
| `addToHistory(entry)` | Agrega una entrada al historial |
| `clearHistory()` | Borra todo el historial |

---

## Tipos TypeScript

**Archivo:** `src/types/simulation.ts`

### Interfaces de parametros

```typescript
MidSquareParams     { seed, count }
MultiplicativeParams { seed, alfa, count }
MonteCarloParams    { seed, a, c, b, count }
```

### Interfaces de resultado por paso

```typescript
GeneratedNumber     { iteration, value, seed }
MidSquareStep       extends GeneratedNumber + { squared, paddedString, middleDigits }
MultiplicativeStep  extends GeneratedNumber + { alfa, product, paddedString, largo, middleDigits }
MonteCarloStep      extends GeneratedNumber + { isSeedRow, a, c, b }
```

### Historial

```typescript
HistoryEntry {
  id:         string;
  method:     string;                   // 'midSquares' | 'multiplicative' | 'monteCarlo'
  seed:       number;
  params:     Record<string, number>;   // todos los parametros usados
  validCount: number;                   // Ri unicos
  totalCount: number;                   // iteraciones generadas
  timestamp:  number;
}
```

---

## Diseño y Estilos

- **Filosofia:** Flat Design estricto — sin gradientes, sin sombras pronunciadas.
- **Paleta:** `slate-900` (fondo oscuro), `slate-50` (fondo claro), `accent` (color de acento via variable CSS personalizada).
- **Tipografia:** `uppercase` + `tracking-widest` para etiquetas y encabezados.
- **Bordes:** Sin `border-radius` (esquinas cuadradas en toda la UI).
- **Graficas:** Recharts con paleta minimalista — indigo para medias (`#4f46e5`), cyan para varianza (`#0891b2`).
- **Formulas:** Renderizadas con KaTeX via `react-katex`.
