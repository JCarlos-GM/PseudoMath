import { useState } from 'react';
import {
  Settings2, Play, Hash, ListOrdered, Maximize,
  Activity, Calculator, AlertTriangle, RotateCcw,
  CheckCircle, XCircle, Dice5, Copy, Check, History
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import { useSimulationStore } from '../store/useSimulationStore';
import { generateMidSquares }    from '../core/generators/midSquares';
import { generateMultiplicative } from '../core/generators/multiplicative';
import { generateMonteCarlo }    from '../core/generators/monteCarlo';
import type { MidSquareStep, MultiplicativeStep, MonteCarloStep, HistoryEntry } from '../types/simulation';

type AnyStep = MidSquareStep | MultiplicativeStep | MonteCarloStep;

const MC_DEFAULTS = { a: 1103515245, c: 12345, b: 2147483648 };

const METHOD_BADGE: Record<string, string> = {
  midSquares:     'bg-accent text-white',
  multiplicative: 'bg-slate-700 text-white',
  monteCarlo:     'bg-emerald-600 text-white',
};
const METHOD_SHORT: Record<string, string> = {
  midSquares:     'C.M.',
  multiplicative: 'MULT',
  monteCarlo:     'M.C.',
};
function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}
function countValid(results: AnyStep[]): number {
  const seen = new Set<string>();
  let n = 0;
  for (const s of results) {
    if ((s as any).isSeedRow) continue;
    const key = s.value.toFixed(4);
    if (!seen.has(key)) { seen.add(key); n++; }
  }
  return n;
}

const GENERATION_METHODS = [
  { id: 'midSquares',     name: 'Cuadrados Medios',     icon: Maximize, ready: true  },
  { id: 'multiplicative', name: 'Método Multiplicativo', icon: Hash,     ready: true  },
  { id: 'monteCarlo',     name: 'Monte-Carlo',           icon: Activity, ready: true  },
];

// ── Helpers ──────────────────────────────────────────────────
function HighlightedPadded({ padded, middle }: { padded: string; middle: string }) {
  const start = padded.indexOf(middle);
  if (start === -1) return <span className="font-mono">{padded}</span>;
  const pre  = padded.slice(0, start);
  const post = padded.slice(start + middle.length);
  return (
    <span className="font-mono tracking-widest">
      <span className="text-slate-400">{pre}</span>
      <span className="text-accent font-black bg-accent/10 px-0.5">{middle}</span>
      <span className="text-slate-400">{post}</span>
    </span>
  );
}

function annotateSteps(steps: AnyStep[]) {
  const seen = new Set<string>();
  return steps.map((step) => {
    // La fila semilla de Monte Carlo nunca participa en detección de duplicados
    if ((step as any).isSeedRow) return { ...step, isDuplicate: false };
    const key = step.value.toFixed(4);
    const isDuplicate = seen.has(key);
    if (!isDuplicate) seen.add(key);
    return { ...step, isDuplicate };
  });
}

function generateRandomSeed(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

function copyValidRi(annotated: ReturnType<typeof annotateSteps>, setFeedback: (s: string) => void) {
  const text = annotated
    .filter((s) => !s.isDuplicate && !(s as any).isSeedRow)
    .map((s) => s.value.toFixed(4))
    .join('\n');
  navigator.clipboard.writeText(text)
    .then(() => { setFeedback('Copiado'); setTimeout(() => setFeedback(''), 2000); })
    .catch(() => setFeedback('Error'));
}

// ── Celda rᵢ ─────────────────────────────────────────────────
function RiCell({ value, isDuplicate }: { value: number; isDuplicate: boolean }) {
  if (isDuplicate) return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <span className="font-mono font-black text-sm text-red-500 tabular-nums">{value.toFixed(4)}</span>
      <span className="text-[9px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 tracking-wider">DUP</span>
    </span>
  );
  return <span className="font-mono font-black text-sm text-accent tabular-nums">{value.toFixed(4)}</span>;
}

// ── Page ─────────────────────────────────────────────────────
export default function Generators() {
  const [activeMethod, setActiveMethod]           = useState<string>('midSquares');
  const [seed, setSeed]                           = useState<string>('');
  const [alfa, setAlfa]                           = useState<string>('');
  const [iterations, setIterations]               = useState<string>('20');
  const [error, setError]                         = useState<string | null>(null);
  const [degenerated, setDegenerated]             = useState(false);
  const [steps, setSteps]                         = useState<AnyStep[]>([]);
  const [resultMethod, setResultMethod]           = useState<string>('midSquares');
  const [clipboardFeedback, setClipboardFeedback] = useState<string>('');

  // Monte Carlo state
  const [aParam, setAParam]           = useState<string>('');
  const [cParam, setCParam]           = useState<string>('');
  const [bParam, setBParam]           = useState<string>('');
  const [useDefaults, setUseDefaults] = useState<boolean>(true);

  const { setSimulationData, clearSimulation, addToHistory, history } = useSimulationStore();
  const hasResults = steps.length > 0;
  const isMult = activeMethod === 'multiplicative';
  const isMC   = activeMethod === 'monteCarlo';

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDegenerated(false);

    try {
      const parsedCount = parseInt(iterations, 10);
      if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 500)
        throw new Error('Las iteraciones deben estar entre 1 y 500.');

      if (activeMethod === 'midSquares') {
        const parsedSeed = parseInt(seed, 10);
        if (isNaN(parsedSeed) || parsedSeed < 1000 || parsedSeed > 9999)
          throw new Error('La semilla debe ser exactamente de 4 dígitos (1000–9999).');
        const results = generateMidSquares({ seed: parsedSeed, count: parsedCount });
        setSteps(results);
        setSimulationData(results, 'midSquares');
        if (results.length < parsedCount) setDegenerated(true);
        addToHistory({ id: String(Date.now()), method: 'midSquares', seed: parsedSeed, params: { count: parsedCount }, validCount: countValid(results as AnyStep[]), totalCount: results.length, timestamp: Date.now() });

      } else if (activeMethod === 'multiplicative') {
        const parsedSeed = parseInt(seed, 10);
        if (isNaN(parsedSeed) || parsedSeed < 1000 || parsedSeed > 9999)
          throw new Error('La semilla debe ser exactamente de 4 dígitos (1000–9999).');
        const parsedAlfa = parseInt(alfa, 10);
        if (isNaN(parsedAlfa) || parsedAlfa < 1000 || parsedAlfa > 9999)
          throw new Error('Alfa debe ser exactamente de 4 dígitos (1000–9999).');
        const results = generateMultiplicative({ alfa: parsedAlfa, seed: parsedSeed, count: parsedCount });
        setSteps(results);
        setSimulationData(results, 'multiplicative');
        if (results.length < parsedCount) setDegenerated(true);
        addToHistory({ id: String(Date.now()), method: 'multiplicative', seed: parsedSeed, params: { alfa: parsedAlfa, count: parsedCount }, validCount: countValid(results as AnyStep[]), totalCount: results.length, timestamp: Date.now() });

      } else if (activeMethod === 'monteCarlo') {
        const parsedA = useDefaults ? MC_DEFAULTS.a : parseInt(aParam, 10);
        const parsedC = useDefaults ? MC_DEFAULTS.c : parseInt(cParam, 10);
        const parsedB = useDefaults ? MC_DEFAULTS.b : parseInt(bParam, 10);

        if (!useDefaults) {
          if (isNaN(parsedA) || parsedA <= 0 || parsedA % 2 === 0)
            throw new Error('El parámetro a debe ser un número impar positivo.');
          if (isNaN(parsedC) || parsedC <= 0)
            throw new Error('El parámetro c debe ser un número positivo.');
          if (isNaN(parsedB) || parsedB <= 1)
            throw new Error('El parámetro b debe ser mayor que 1.');
          if (parsedC >= parsedB)
            throw new Error('El parámetro c debe ser menor que b.');
        }

        const parsedSeed = parseInt(seed, 10);
        if (isNaN(parsedSeed) || parsedSeed <= 0)
          throw new Error('La semilla debe ser un entero positivo.');

        const results = generateMonteCarlo({ seed: parsedSeed, a: parsedA, c: parsedC, b: parsedB, count: parsedCount });
        setSteps(results);
        setSimulationData(results, 'monteCarlo');
        if (results.length < parsedCount) setDegenerated(true);
        addToHistory({ id: String(Date.now()), method: 'monteCarlo', seed: parsedSeed, params: { a: parsedA, c: parsedC, b: parsedB, count: parsedCount, useDefaults: useDefaults ? 1 : 0 }, validCount: countValid(results as AnyStep[]), totalCount: results.length - 1, timestamp: Date.now() });
      }

      setResultMethod(activeMethod);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setSteps([]);
    setError(null);
    setDegenerated(false);
    setSeed('');
    setAlfa('');
    setIterations('20');
    setAParam('');
    setCParam('');
    setBParam('');
    setUseDefaults(true);
    clearSimulation();
  };

  const handleRestore = (entry: HistoryEntry) => {
    setError(null);
    setDegenerated(false);
    setActiveMethod(entry.method);
    setSeed(String(entry.seed));
    setIterations(String(entry.params.count));

    if (entry.method === 'midSquares') {
      setAlfa('');
      const r = generateMidSquares({ seed: entry.seed, count: entry.params.count });
      setSteps(r);
      setSimulationData(r, 'midSquares');
      if (r.length < entry.params.count) setDegenerated(true);

    } else if (entry.method === 'multiplicative') {
      setAlfa(String(entry.params.alfa));
      const r = generateMultiplicative({ seed: entry.seed, alfa: entry.params.alfa, count: entry.params.count });
      setSteps(r);
      setSimulationData(r, 'multiplicative');
      if (r.length < entry.params.count) setDegenerated(true);

    } else if (entry.method === 'monteCarlo') {
      const ud = Boolean(entry.params.useDefaults);
      setUseDefaults(ud);
      setAParam(ud ? '' : String(entry.params.a));
      setCParam(ud ? '' : String(entry.params.c));
      setBParam(ud ? '' : String(entry.params.b));
      const r = generateMonteCarlo({ seed: entry.seed, a: entry.params.a, c: entry.params.c, b: entry.params.b, count: entry.params.count });
      setSteps(r);
      setSimulationData(r, 'monteCarlo');
    }

    setResultMethod(entry.method);
  };

  const annotated   = annotateSteps(steps);
  // Para MC excluimos la fila semilla ("No vale") de los contadores
  const countable   = annotated.filter((s) => !(s as any).isSeedRow);
  const validCount  = countable.filter((s) => !s.isDuplicate).length;
  const dupCount    = countable.length - validCount;
  const hasDups     = dupCount > 0;

  // ── Paneles de configuración ────────────────────────────────
  const AlgorithmPanel = (
    <div className="bg-white border border-slate-200 p-6 shadow-sm flex-shrink-0">
      <h2 className={`font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2 ${hasResults ? 'text-xs' : 'text-sm'}`}>
        <Settings2 size={hasResults ? 14 : 18} />
        Algoritmo
      </h2>
      <div className="flex flex-col gap-2">
        {GENERATION_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => method.ready && setActiveMethod(method.id)}
            className={`flex items-center gap-3 w-full text-left font-semibold transition-colors border ${
              hasResults ? 'p-3 text-sm' : 'p-4 text-base'
            } ${
              !method.ready
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                : activeMethod === method.id
                ? 'bg-accent text-white border-accent'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <method.icon size={hasResults ? 16 : 20} />
            <span className="flex-1">{method.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const ParamsPanel = (
    <form onSubmit={handleGenerate} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-5 flex-shrink-0">
      <h2 className={`font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 ${hasResults ? 'text-xs' : 'text-sm'}`}>
        <ListOrdered size={hasResults ? 14 : 18} />
        Parámetros de Entrada
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 flex items-start gap-2">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Parámetros exclusivos de Monte Carlo ── */}
      {isMC && (
        <div className="flex flex-col gap-3">
          {/* Toggle */}
          <div className="flex border border-slate-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setUseDefaults(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                useDefaults ? 'bg-accent text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              Predeterminados
            </button>
            <button
              type="button"
              onClick={() => setUseDefaults(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-l border-slate-300 ${
                !useDefaults ? 'bg-accent text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              Manual
            </button>
          </div>

          {useDefaults ? (
            <div className="bg-slate-50 border border-slate-200 p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Valores óptimos (glibc LCG)</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {([['a', MC_DEFAULTS.a], ['c', MC_DEFAULTS.c], ['b', MC_DEFAULTS.b]] as [string, number][]).map(([key, val]) => (
                  <div key={key} className="bg-white border border-slate-200 p-2">
                    <p className="text-[9px] uppercase font-bold text-slate-400">{key}</p>
                    <p className={`font-mono font-bold text-slate-700 ${hasResults ? 'text-[10px]' : 'text-xs'}`}>{val.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className={`block font-bold text-slate-600 uppercase mb-1.5 ${hasResults ? 'text-xs' : 'text-sm'}`}>
                  a <span className="font-normal normal-case text-slate-400">(multiplicador)</span>
                </label>
                <input
                  type="number"
                  value={aParam}
                  onChange={(e) => setAParam(e.target.value)}
                  placeholder="Ej. 1103515245"
                  className={`w-full bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Número impar (no par).</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold text-slate-600 uppercase mb-1.5 ${hasResults ? 'text-xs' : 'text-sm'}`}>c</label>
                  <input
                    type="number"
                    value={cParam}
                    onChange={(e) => setCParam(e.target.value)}
                    placeholder="Ej. 12345"
                    className={`w-full bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">No cuadrado perfecto.</p>
                </div>
                <div>
                  <label className={`block font-bold text-slate-600 uppercase mb-1.5 ${hasResults ? 'text-xs' : 'text-sm'}`}>
                    b <span className="font-normal normal-case text-slate-400">(módulo)</span>
                  </label>
                  <input
                    type="number"
                    value={bParam}
                    onChange={(e) => setBParam(e.target.value)}
                    placeholder="Ej. 2147483648"
                    className={`w-full bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Cuadrado perfecto (2ⁿ).</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${hasResults ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>

        {/* Alfa — solo para multiplicativo */}
        {isMult && (
          <div>
            <label className={`block font-bold text-slate-600 uppercase mb-1.5 ${hasResults ? 'text-xs' : 'text-sm'}`}>
              Alfa (α)
            </label>
            <div className="flex border border-slate-300 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
              <input
                type="number"
                value={alfa}
                onChange={(e) => setAlfa(e.target.value)}
                placeholder="Ej. 1234"
                min={1000}
                max={9999}
                className={`flex-1 min-w-0 bg-slate-50 text-slate-800 focus:outline-none ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
                required
              />
              <button
                type="button"
                onClick={() => setAlfa(generateRandomSeed().toString())}
                title="Generar Alfa aleatorio"
                className="flex-shrink-0 px-3 bg-slate-100 hover:bg-accent hover:text-white text-slate-500 border-l border-slate-300 transition-colors"
              >
                <Dice5 size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Exactamente 4 dígitos (1000–9999).</p>
          </div>
        )}

        {/* Semilla */}
        <div>
          <label className={`block font-bold text-slate-600 uppercase mb-1.5 ${hasResults ? 'text-xs' : 'text-sm'}`}>
            {isMult ? 'Semilla Beta (X₀)' : 'Semilla X₀'}
          </label>
          <div className="flex border border-slate-300 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder={isMC ? 'Ej. 83' : 'Ej. 4321'}
              min={isMC ? 1 : 1000}
              max={isMC ? undefined : 9999}
              className={`flex-1 min-w-0 bg-slate-50 text-slate-800 focus:outline-none ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
              required
            />
            <button
              type="button"
              onClick={() => setSeed(generateRandomSeed().toString())}
              title="Generar semilla aleatoria"
              className="flex-shrink-0 px-3 bg-slate-100 hover:bg-accent hover:text-white text-slate-500 border-l border-slate-300 transition-colors"
            >
              <Dice5 size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isMC ? 'Entero positivo.' : 'Exactamente 4 dígitos (1000–9999).'}
          </p>
        </div>

        {/* Iteraciones */}
        <div>
          <label className={`block font-bold text-slate-600 mb-1.5 uppercase ${hasResults ? 'text-xs' : 'text-sm'}`}>
            Iteraciones n
          </label>
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(e.target.value)}
            placeholder="Ej. 20"
            min={1}
            max={500}
            className={`w-full bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${hasResults ? 'text-sm p-2.5' : 'text-base p-3'}`}
            required
          />
          <p className="text-[10px] text-slate-400 mt-1">Máximo 500.</p>
        </div>
      </div>

      {/* Fórmula con LaTeX */}
      <div className="bg-slate-50 border border-slate-200 p-4 text-center space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fórmula</p>
        <div className="space-y-1 text-slate-700">
          {isMC ? (
            <>
              <BlockMath math={`X_{n+1} = (a \\cdot X_n + c) \\bmod b`} />
              <BlockMath math={`r_i = \\frac{X_{n+1}}{b}`} />
            </>
          ) : isMult ? (
            <>
              <BlockMath math={`X_{i+1} = \\text{centrales}(\\alpha \\times X_i)`} />
              <BlockMath math={`r_i = \\frac{X_{i+1}}{10^d}`} />
            </>
          ) : (
            <>
              <BlockMath math={`X_{i+1} = \\text{centrales}(X_i^2)`} />
              <BlockMath math={`r_i = \\frac{X_i}{10^d}`} />
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={`w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold hover:bg-accent transition-colors ${hasResults ? 'py-3 text-sm' : 'py-4 text-base'}`}
      >
        <Play size={hasResults ? 16 : 20} fill="currentColor" />
        Ejecutar Simulación
      </button>
    </form>
  );

  // ── Etiquetas de tabla por método ───────────────────────────
  const METHOD_LABELS: Record<string, string> = {
    midSquares:     'Cuadrados Medios',
    multiplicative: 'Método Multiplicativo',
    monteCarlo:     'Monte-Carlo (Congruencial Lineal)',
  };

  return (
    <div className="h-full flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Calculator size={24} className="text-accent" />
            Laboratorio de Generación
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Configure los parámetros iniciales y ejecute el algoritmo seleccionado.
          </p>
        </div>
        {hasResults && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent border border-slate-200 hover:border-accent px-3 py-2 transition-colors"
          >
            <RotateCcw size={13} />
            Reiniciar
          </button>
        )}
      </div>

      {/* ── Layout vacío ─────────────────────────────────────── */}
      {!hasResults && (
        <div className="flex flex-col gap-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {AlgorithmPanel}
            {ParamsPanel}
          </div>
          <div className="min-h-[120px] bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center gap-3 py-8">
            <Activity size={36} strokeWidth={1.25} className="text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">Los resultados aparecerán aquí</p>
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Seleccione un algoritmo, ingrese los parámetros y pulse{' '}
              <span className="font-bold text-slate-500">Ejecutar Simulación</span>.
            </p>
          </div>

          {/* Historial de simulaciones */}
          {history.length > 0 && (
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <History size={14} />
                  Historial de Simulaciones
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">
                  {history.length} {history.length === 1 ? 'entrada' : 'entradas'}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {[...history].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 tracking-widest flex-shrink-0 ${METHOD_BADGE[entry.method]}`}>
                      {METHOD_SHORT[entry.method]}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
                      <span className="font-mono font-bold text-sm text-slate-700">X₀ = {entry.seed}</span>
                      {entry.params.alfa !== undefined && (
                        <span className="font-mono text-xs text-slate-500">α = {entry.params.alfa}</span>
                      )}
                      <span className="text-xs text-slate-400">
                        <span className="text-accent font-bold">{entry.validCount}</span> válidos · {entry.totalCount} iter.
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTs(entry.timestamp)}</span>
                    <button
                      onClick={() => handleRestore(entry)}
                      className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                    >
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Layout con resultados ────────────────────────────── */}
      {hasResults && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">

          {/* Columna izquierda */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
            {AlgorithmPanel}
            {ParamsPanel}
          </div>

          {/* Tabla */}
          <div className="flex-1 bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">

            {/* Cabecera */}
            <div className="border-b border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Resultados — {METHOD_LABELS[resultMethod]}
              </h3>
              <span className="text-xs font-bold text-slate-400">{countable.length} iteraciones generadas</span>
            </div>

            {/* Banner de duplicados */}
            <div className={`flex items-center gap-3 px-5 py-3 border-b flex-shrink-0 ${hasDups ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              {hasDups
                ? <XCircle size={18} className="text-red-500 flex-shrink-0" />
                : <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              }
              <span className={`text-sm font-black ${hasDups ? 'text-red-700' : 'text-emerald-700'}`}>
                {validCount} rᵢ únicos
              </span>
              {hasDups
                ? <span className="text-sm font-bold text-red-500">— {dupCount} {dupCount === 1 ? 'valor repetido' : 'valores repetidos'} detectados</span>
                : <span className="text-sm font-bold text-emerald-600">— Sin repeticiones. Secuencia válida.</span>
              }
            </div>

            {/* Alerta de degeneración */}
            {degenerated && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm font-bold flex-shrink-0">
                <AlertTriangle size={15} className="flex-shrink-0" />
                El generador degeneró en la iteración {steps.length} — Xᵢ colapsó a 0.
              </div>
            )}

            {/* Cuerpo de tabla */}
            <div className="flex-1 overflow-auto">

              {/* Tabla: Cuadrados Medios */}
              {resultMethod === 'midSquares' && (
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-accent text-white">
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center text-white/70 w-14">i</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Xᵢ</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Xᵢ²</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">
                        Xᵢ² <span className="text-white/60 normal-case font-normal">(2d díg.)</span>
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Díg. centrales</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">rᵢ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annotated.map((row, idx) => {
                      const r = row as MidSquareStep & { isDuplicate: boolean };
                      const bg = r.isDuplicate ? 'bg-red-50 hover:bg-red-100'
                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100';
                      const tc = r.isDuplicate ? 'text-red-500' : 'text-slate-500';
                      const tb = r.isDuplicate ? 'text-red-600' : 'text-slate-800';
                      return (
                        <tr key={r.iteration} className={`${bg} transition-colors border-b border-slate-100`}>
                          <td className="px-4 py-3 text-center font-mono font-bold text-sm text-slate-400">{r.iteration}</td>
                          <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${tb}`}>{r.seed}</td>
                          <td className={`px-4 py-3 text-center font-mono text-sm ${tc}`}>{r.squared}</td>
                          <td className="px-4 py-3 text-center">
                            {r.isDuplicate
                              ? <span className={`font-mono tracking-widest text-sm ${tc}`}>{r.paddedString}</span>
                              : <HighlightedPadded padded={r.paddedString} middle={r.middleDigits} />
                            }
                          </td>
                          <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${r.isDuplicate ? 'text-red-500' : 'text-slate-700'}`}>{r.middleDigits}</td>
                          <td className="px-4 py-3 text-center"><RiCell value={r.value} isDuplicate={r.isDuplicate} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Tabla: Multiplicativo */}
              {resultMethod === 'multiplicative' && (
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-accent text-white">
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center text-white/70 w-14">No.</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Alfa (α)</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Beta (Xᵢ)</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">α × Xᵢ</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">
                        Completar <span className="text-white/60 normal-case font-normal">(2d díg.)</span>
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Largo</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Centro</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">rᵢ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annotated.map((row, idx) => {
                      const r = row as MultiplicativeStep & { isDuplicate: boolean };
                      const bg = r.isDuplicate ? 'bg-red-50 hover:bg-red-100'
                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100';
                      const tc = r.isDuplicate ? 'text-red-500' : 'text-slate-500';
                      const tb = r.isDuplicate ? 'text-red-600' : 'text-slate-800';
                      return (
                        <tr key={r.iteration} className={`${bg} transition-colors border-b border-slate-100`}>
                          <td className="px-4 py-3 text-center font-mono font-bold text-sm text-slate-400">{r.iteration}</td>
                          <td className={`px-4 py-3 text-center font-mono text-sm ${tc}`}>{r.alfa}</td>
                          <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${tb}`}>{r.seed}</td>
                          <td className={`px-4 py-3 text-center font-mono text-sm ${tc}`}>{r.product}</td>
                          <td className="px-4 py-3 text-center">
                            {r.isDuplicate
                              ? <span className={`font-mono tracking-widest text-sm ${tc}`}>{r.paddedString}</span>
                              : <HighlightedPadded padded={r.paddedString} middle={r.middleDigits} />
                            }
                          </td>
                          <td className={`px-4 py-3 text-center font-mono text-sm ${tc}`}>{r.largo}</td>
                          <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${r.isDuplicate ? 'text-red-500' : 'text-slate-700'}`}>{r.middleDigits}</td>
                          <td className="px-4 py-3 text-center"><RiCell value={r.value} isDuplicate={r.isDuplicate} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Tabla: Monte Carlo */}
              {resultMethod === 'monteCarlo' && (
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-accent text-white">
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center text-white/70 w-14">n</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">x</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-widest text-center">Rᵢ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annotated.map((row, idx) => {
                      const r = row as MonteCarloStep & { isDuplicate: boolean };

                      // Fila semilla — ocultar
                      if (r.isSeedRow) return null;

                      // Filas generadas
                      const bg = r.isDuplicate ? 'bg-red-50 hover:bg-red-100'
                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100';
                      const tb = r.isDuplicate ? 'text-red-600' : 'text-slate-800';
                      return (
                        <tr key={r.iteration} className={`${bg} transition-colors border-b border-slate-100`}>
                          <td className="px-4 py-3 text-center font-mono font-bold text-sm text-slate-400">{r.iteration - 1}</td>
                          <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${tb}`}>{r.seed}</td>
                          <td className="px-4 py-3 text-center"><RiCell value={r.value} isDuplicate={r.isDuplicate} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center gap-6 flex-shrink-0 flex-wrap">
              <Stat label="n total"    value={countable.length.toString()} />
              <Stat label="Únicos"     value={validCount.toString()} accent />
              <Stat label="Duplicados" value={dupCount.toString()} danger={hasDups} />
              <button
                onClick={() => copyValidRi(annotated, setClipboardFeedback)}
                className="ml-auto flex items-center gap-1.5 text-accent hover:text-accent/70 font-bold text-xs uppercase tracking-wider transition-colors px-2 py-1 hover:bg-accent/10"
              >
                {clipboardFeedback ? <><Check size={14} />{clipboardFeedback}</> : <><Copy size={14} />Copiar válidos</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false, danger = false }: {
  label: string; value: string; accent?: boolean; danger?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-sm font-black font-mono ${danger && value !== '0' ? 'text-red-500' : accent ? 'text-accent' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
