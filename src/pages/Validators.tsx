import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import {
  CheckSquare, AlertTriangle, BarChart, Percent, LayoutGrid,
  Activity, Settings2, Play, History, CheckCircle, XCircle,
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { generateMidSquares }    from '../core/generators/midSquares';
import { generateMultiplicative } from '../core/generators/multiplicative';
import { generateMonteCarlo }    from '../core/generators/monteCarlo';
import { testMeans, type MeansResult } from '../core/validators/means';
import type { HistoryEntry } from '../types/simulation';

const VALIDATION_TESTS = [
  { id: 'means',       name: 'Prueba de Medias',              icon: Percent,    ready: true  },
  { id: 'variance',    name: 'Prueba de Varianza',            icon: BarChart,   ready: false },
  { id: 'chiSquare',   name: 'Prueba Chi-Cuadrada',           icon: LayoutGrid, ready: false },
  { id: 'kolmogorov',  name: 'Prueba Kolmogorov-Smirnov',     icon: Activity,   ready: false },
  { id: 'poker',       name: 'Prueba de Póker',               icon: CheckSquare,ready: false },
];

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
const Z_LABEL: Record<string, string> = { '0.01': '2.576', '0.05': '1.96', '0.10': '1.645' };

function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function Validators() {
  const navigate = useNavigate();
  const { generatedNumbers, methodUsed, setSimulationData, history } = useSimulationStore();

  const [activeTest, setActiveTest] = useState<string>('means');
  const [alpha, setAlpha]           = useState<string>('0.05');
  const [meansResult, setMeansResult] = useState<MeansResult | null>(null);

  // Excluir la fila semilla de Monte Carlo
  const displayNumbers = generatedNumbers.filter(n => !(n as any).isSeedRow);
  const riValues       = displayNumbers.map(n => n.value);

  const handleRestore = (entry: HistoryEntry) => {
    if (entry.method === 'midSquares') {
      setSimulationData(generateMidSquares({ seed: entry.seed, count: entry.params.count }), 'midSquares');
    } else if (entry.method === 'multiplicative') {
      setSimulationData(generateMultiplicative({ seed: entry.seed, alfa: entry.params.alfa, count: entry.params.count }), 'multiplicative');
    } else if (entry.method === 'monteCarlo') {
      setSimulationData(generateMonteCarlo({ seed: entry.seed, a: entry.params.a, c: entry.params.c, b: entry.params.b, count: entry.params.count }), 'monteCarlo');
    }
    setMeansResult(null);
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTest === 'means') {
      setMeansResult(testMeans(riValues, parseFloat(alpha)));
    }
  };

  // ── Sin datos y sin historial ────────────────────────────────
  if (generatedNumbers.length === 0 && history.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white border border-slate-300 p-8 max-w-md w-full text-center shadow-sm">
          <div className="bg-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-6 border border-slate-200 text-slate-400">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ausencia de Datos</h2>
          <p className="text-slate-500 text-sm mb-6">
            No se han encontrado secuencias pseudoaleatorias en memoria. Ejecute un generador antes de aplicar pruebas estadísticas.
          </p>
          <button
            onClick={() => navigate('/generadores')}
            className="w-full bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors"
          >
            Ir al Laboratorio de Generación
          </button>
        </div>
      </div>
    );
  }

  // ── Sin datos activos pero con historial ─────────────────────
  if (generatedNumbers.length === 0 && history.length > 0) {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white border border-slate-300 p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <CheckSquare size={24} className="text-accent" />
              Módulo de Validación Estadística
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              No hay una secuencia activa. Restaura una del historial para continuar.
            </p>
          </div>
          <button
            onClick={() => navigate('/generadores')}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent border border-slate-200 hover:border-accent px-3 py-2 transition-colors"
          >
            Ir al Laboratorio
          </button>
        </div>

        <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
          <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-slate-50 gap-2">
            <History size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Historial de Simulaciones
            </h3>
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
      </div>
    );
  }

  // ── Vista principal ──────────────────────────────────────────
  const descendingNumbers = displayNumbers;

  return (
    <div className="h-full flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between bg-white border border-slate-300 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CheckSquare size={24} className="text-accent" />
            Módulo de Validación Estadística
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Analizando muestra de{' '}
            <span className="font-bold text-slate-700">{displayNumbers.length}</span> números · vía{' '}
            <span className="uppercase tracking-wider text-xs font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 ml-1">{methodUsed}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">

        {/* Panel izquierdo */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">

          {/* Selector de prueba */}
          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 size={16} />
              Selección de Prueba
            </h2>
            <div className="flex flex-col gap-2">
              {VALIDATION_TESTS.map((test) => (
                <button
                  key={test.id}
                  onClick={() => { if (test.ready) { setActiveTest(test.id); setMeansResult(null); } }}
                  className={`flex items-center gap-3 w-full p-3 text-left text-sm font-semibold transition-colors border ${
                    !test.ready
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : activeTest === test.id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                  }`}
                >
                  <test.icon size={18} />
                  <span className="flex-1">{test.name}</span>
                  {!test.ready && <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Próx.</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Parámetros + ejecutar */}
          <form onSubmit={handleValidate} className="bg-white border border-slate-300 p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={16} />
              Parámetros de Evaluación
            </h2>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Nivel de Significancia <InlineMath math="\alpha" />
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
              >
                <option value="0.01">0.01 (99% Confianza)</option>
                <option value="0.05">0.05 (95% Confianza)</option>
                <option value="0.10">0.10 (90% Confianza)</option>
              </select>
            </div>

            {activeTest === 'means' && (
              <div className="bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Criterio de Aceptación</p>
                <InlineMath math={`L_I \\leq \\bar{r} \\leq L_S`} />
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Z<sub>α/2</sub> = {Z_LABEL[alpha] ?? '?'}  ·  n = {displayNumbers.length}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors"
            >
              <Play size={18} fill="currentColor" />
              Ejecutar Validación
            </button>
          </form>
        </div>

        {/* Panel derecho */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">

          {/* Reporte */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col">
            <div className="border-b border-slate-300 p-4 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reporte Analítico</h3>
              {meansResult && (
                <div className={`flex items-center gap-2 px-3 py-1.5 font-black text-sm border ${
                  meansResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {meansResult.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {meansResult.passed ? 'APROBADO' : 'RECHAZADO'}
                </div>
              )}
            </div>

            {!meansResult ? (
              <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                <LayoutGrid size={40} className="mb-3 text-slate-200" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-400">Seleccione una prueba y pulse Ejecutar Validación</p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-5">
                {/* Cuadrícula de estadísticos — igual que en Excel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Promedio (r̄)"
                    value={meansResult.mean.toFixed(7)}
                    highlight={meansResult.passed ? 'green' : 'red'}
                  />
                  <StatCard
                    label={`√(12·${meansResult.n})`}
                    value={meansResult.sqrtFactor.toFixed(7)}
                  />
                  <StatCard
                    label="L. Inferior (Lᵢ)"
                    value={meansResult.lowerLimit.toFixed(8)}
                  />
                  <StatCard
                    label="L. Superior (Lₛ)"
                    value={meansResult.upperLimit.toFixed(8)}
                  />
                </div>

                {/* Veredicto */}
                <div className={`p-4 border text-sm font-semibold leading-relaxed ${
                  meansResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {meansResult.passed
                    ? `La secuencia aprueba la Prueba de Medias con α = ${meansResult.alpha}. El promedio r̄ = ${meansResult.mean.toFixed(4)} se encuentra dentro del intervalo de aceptación [${meansResult.lowerLimit.toFixed(4)}, ${meansResult.upperLimit.toFixed(4)}].`
                    : `La secuencia no aprueba la Prueba de Medias con α = ${meansResult.alpha}. El promedio r̄ = ${meansResult.mean.toFixed(4)} cae fuera del intervalo de aceptación [${meansResult.lowerLimit.toFixed(4)}, ${meansResult.upperLimit.toFixed(4)}].`
                  }
                </div>
              </div>
            )}
          </div>

          {/* Tabla de secuencia */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1">
            <div className="border-b border-slate-300 p-4 bg-slate-50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Secuencia de Entrada</h3>
              <span className="text-xs text-slate-400 font-bold">{displayNumbers.length} números</span>
            </div>
            <div className="overflow-auto max-h-72">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-center text-white/60 w-20">N</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-center">Rᵢ</th>
                  </tr>
                </thead>
                <tbody>
                  {descendingNumbers.map((num, idx) => (
                    <tr
                      key={num.iteration}
                      className={`border-b border-slate-100 transition-colors ${
                        idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-sm text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-black text-sm text-accent tabular-nums">
                        {num.value.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: {
  label: string;
  value: string;
  highlight?: 'green' | 'red';
}) {
  return (
    <div className={`border p-3 ${
      highlight === 'green' ? 'bg-emerald-50 border-emerald-200'
      : highlight === 'red' ? 'bg-red-50 border-red-200'
      : 'bg-slate-50 border-slate-200'
    }`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`font-mono font-black text-sm tabular-nums ${
        highlight === 'green' ? 'text-emerald-700'
        : highlight === 'red' ? 'text-red-600'
        : 'text-slate-800'
      }`}>
        {value}
      </p>
    </div>
  );
}
