import { useState } from 'react';
import {
  Settings2, Play, Hash, ListOrdered, Maximize,
  Activity, Calculator, AlertTriangle, RotateCcw,
  CheckCircle, XCircle
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { generateMidSquares } from '../core/generators/midSquares';
import type { MidSquareStep } from '../types/simulation';

const GENERATION_METHODS = [
  { id: 'midSquares',     name: 'Cuadrados Medios',           icon: Maximize, ready: true  },
  { id: 'multiplicative', name: 'Congruencial Multiplicativo', icon: Hash,     ready: false },
  { id: 'monteCarlo',     name: 'Simulación Monte Carlo',      icon: Activity, ready: false },
];

// Resalta los dígitos centrales dentro del string de 2d dígitos
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

// Anota cada paso con si su rᵢ ya fue visto antes (duplicado)
function annotateSteps(steps: MidSquareStep[]) {
  const seen = new Set<string>();
  return steps.map((step) => {
    const key = step.value.toFixed(4);
    const isDuplicate = seen.has(key);
    if (!isDuplicate) seen.add(key);
    return { ...step, isDuplicate };
  });
}

export default function Generators() {
  const [activeMethod, setActiveMethod] = useState<string>('midSquares');
  const [seed, setSeed]             = useState<string>('');
  const [iterations, setIterations] = useState<string>('20');
  const [error, setError]           = useState<string | null>(null);
  const [degenerated, setDegenerated] = useState(false);
  const [steps, setSteps]           = useState<MidSquareStep[]>([]);

  const { setSimulationData, clearSimulation } = useSimulationStore();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDegenerated(false);

    try {
      const parsedSeed  = parseInt(seed, 10);
      const parsedCount = parseInt(iterations, 10);

      if (isNaN(parsedSeed) || isNaN(parsedCount)) {
        throw new Error('Los parámetros deben ser valores numéricos válidos.');
      }
      if (parsedCount < 1 || parsedCount > 500) {
        throw new Error('Las iteraciones deben estar entre 1 y 500.');
      }

      const results = generateMidSquares({ seed: parsedSeed, count: parsedCount });
      setSteps(results);
      setSimulationData(results, 'midSquares');

      if (results.length < parsedCount) setDegenerated(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setSteps([]);
    setError(null);
    setDegenerated(false);
    setSeed('');
    setIterations('20');
    clearSimulation();
  };

  // Cálculo de métricas y duplicados
  const annotated   = annotateSteps(steps);
  const validCount  = annotated.filter((s) => !s.isDuplicate).length;
  const dupCount    = annotated.length - validCount;
  const hasDups     = dupCount > 0;

  return (
    <div className="h-full flex flex-col gap-6">

      {/* ── Encabezado ─────────────────────────────────────────── */}
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
        {steps.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent border border-slate-200 hover:border-accent px-3 py-2 transition-colors"
          >
            <RotateCcw size={13} />
            Reiniciar
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">

        {/* ── Panel izquierdo ────────────────────────────────────── */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">

          <div className="bg-white border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Settings2 size={14} />
              Algoritmo
            </h2>
            <div className="flex flex-col gap-1.5">
              {GENERATION_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => method.ready && setActiveMethod(method.id)}
                  className={`flex items-center gap-3 w-full p-3 text-left text-sm font-semibold transition-colors border ${
                    !method.ready
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : activeMethod === method.id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <method.icon size={16} />
                  <span className="flex-1">{method.name}</span>
                  {!method.ready && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Pronto</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="bg-white border border-slate-200 p-5 shadow-sm flex flex-col gap-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ListOrdered size={14} />
              Parámetros
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Semilla X₀</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Ej. 1234"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Mínimo 3 dígitos.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Iteraciones n</label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(e.target.value)}
                  placeholder="Ej. 20"
                  min={1}
                  max={500}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Máximo 500.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 text-center space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Fórmula</p>
              <p className="text-xs font-mono text-slate-700">Xᵢ₊₁ = dígitos centrales(Xᵢ²)</p>
              <p className="text-xs font-mono text-slate-700">rᵢ = Xᵢ / 10<sup>d</sup></p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors text-sm"
            >
              <Play size={16} fill="currentColor" />
              Ejecutar
            </button>
          </form>
        </div>

        {/* ── Panel derecho ──────────────────────────────────────── */}
        <div className="flex-1 bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">

          {/* Cabecera */}
          <div className="border-b border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Resultados — Cuadrados Medios
            </h3>
            {steps.length > 0 && (
              <span className="text-xs font-bold text-slate-400">
                {steps.length} iteraciones generadas
              </span>
            )}
          </div>

          {/* Banner de validación de duplicados */}
          {steps.length > 0 && (
            <div className={`flex items-center gap-4 px-5 py-3 border-b flex-shrink-0 ${
              hasDups
                ? 'bg-red-50 border-red-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              {hasDups ? (
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
              ) : (
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              )}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`text-sm font-black ${hasDups ? 'text-red-700' : 'text-emerald-700'}`}>
                  {validCount} rᵢ únicos
                </span>
                {hasDups && (
                  <span className="text-xs font-bold text-red-500">
                    — {dupCount} {dupCount === 1 ? 'valor repetido' : 'valores repetidos'} detectados
                  </span>
                )}
                {!hasDups && (
                  <span className="text-xs font-bold text-emerald-600">
                    — Sin repeticiones. Secuencia válida.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Alerta de degeneración */}
          {degenerated && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-bold flex-shrink-0">
              <AlertTriangle size={14} className="flex-shrink-0" />
              El generador degeneró en la iteración {steps.length} — Xᵢ colapsó a 0 antes de completar {iterations} iteraciones.
            </div>
          )}

          {/* Tabla */}
          <div className="flex-1 overflow-auto">
            {steps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                <Activity size={40} className="mb-4 text-slate-200" strokeWidth={1.5} />
                <p className="text-base font-semibold text-slate-400">Esperando parámetros</p>
                <p className="text-xs mt-2 text-center max-w-xs text-slate-400">
                  Ingrese la semilla y el número de iteraciones, luego ejecute el algoritmo.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-slate-400 w-10 text-center">i</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-slate-300">Xᵢ</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-slate-300">Xᵢ²</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-slate-300">
                      Xᵢ² <span className="text-slate-500 normal-case font-normal">(2d díg.)</span>
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-slate-300">Díg. centrales</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-accent text-right">rᵢ</th>
                  </tr>
                </thead>
                <tbody>
                  {annotated.map((row, idx) => {
                    const isDup = row.isDuplicate;
                    const isEven = idx % 2 === 0;
                    const rowBg = isDup
                      ? 'bg-red-50 hover:bg-red-100'
                      : isEven
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-slate-50/60 hover:bg-slate-100';

                    return (
                      <tr key={row.iteration} className={`${rowBg} transition-colors border-b border-slate-100`}>
                        {/* i */}
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-mono text-[11px] font-bold ${isDup ? 'text-red-400' : 'text-slate-400'}`}>
                            {row.iteration}
                          </span>
                        </td>

                        {/* Xᵢ */}
                        <td className="px-4 py-2.5">
                          <span className={`font-mono font-bold text-[12px] ${isDup ? 'text-red-600' : 'text-slate-800'}`}>
                            {row.seed}
                          </span>
                        </td>

                        {/* Xᵢ² */}
                        <td className="px-4 py-2.5">
                          <span className={`font-mono ${isDup ? 'text-red-400' : 'text-slate-500'}`}>
                            {row.squared}
                          </span>
                        </td>

                        {/* 2d dígitos resaltados */}
                        <td className="px-4 py-2.5">
                          {isDup ? (
                            <span className="font-mono tracking-widest text-red-400">{row.paddedString}</span>
                          ) : (
                            <HighlightedPadded padded={row.paddedString} middle={row.middleDigits} />
                          )}
                        </td>

                        {/* Dígitos centrales */}
                        <td className="px-4 py-2.5">
                          <span className={`font-mono font-bold ${isDup ? 'text-red-500' : 'text-slate-700'}`}>
                            {row.middleDigits}
                          </span>
                        </td>

                        {/* rᵢ */}
                        <td className="px-4 py-2.5 text-right">
                          {isDup ? (
                            <span className="inline-flex items-center justify-end gap-1.5">
                              <span className="font-mono font-black text-red-500 tabular-nums">
                                {row.value.toFixed(4)}
                              </span>
                              <span className="text-[9px] font-bold uppercase bg-red-500 text-white px-1 py-0.5 tracking-wider">
                                DUP
                              </span>
                            </span>
                          ) : (
                            <span className="font-mono font-black text-accent tabular-nums">
                              {row.value.toFixed(4)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer estadístico */}
          {steps.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center gap-6 flex-shrink-0 flex-wrap">
              <Stat label="n total" value={steps.length.toString()} />
              <Stat label="Únicos" value={validCount.toString()} accent />
              <Stat label="Duplicados" value={dupCount.toString()} danger={hasDups} />
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <Stat label="Media" value={(steps.reduce((s, r) => s + r.value, 0) / steps.length).toFixed(4)} />
              <Stat label="Mín" value={Math.min(...steps.map((r) => r.value)).toFixed(4)} />
              <Stat label="Máx" value={Math.max(...steps.map((r) => r.value)).toFixed(4)} />
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Listos para validación
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, accent = false, danger = false,
}: {
  label: string; value: string; accent?: boolean; danger?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-sm font-black font-mono ${
        danger && value !== '0' ? 'text-red-500' : accent ? 'text-accent' : 'text-slate-800'
      }`}>
        {value}
      </span>
    </div>
  );
}
