import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import {
  CheckSquare, AlertTriangle, BarChart, Percent, LayoutGrid,
  Activity, Settings2, Play, History, CheckCircle, XCircle,
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { useSimulationStore } from '../store/useSimulationStore';
import { generateMidSquares }    from '../core/generators/midSquares';
import { generateMultiplicative } from '../core/generators/multiplicative';
import { generateMonteCarlo }    from '../core/generators/monteCarlo';
import { testMeans,    type MeansResult    } from '../core/validators/means';
import { testVariance, type VarianceResult, chiSquarePDF } from '../core/validators/variance';
import type { HistoryEntry, GeneratedNumber } from '../types/simulation';

// ── Constants ─────────────────────────────────────────────────
const VALIDATION_TESTS = [
  { id: 'means',      name: 'Prueba de Medias',           icon: Percent,    ready: true  },
  { id: 'variance',   name: 'Prueba de Varianza',         icon: BarChart,   ready: true  },
  { id: 'chiSquare',  name: 'Prueba Chi-Cuadrada',        icon: LayoutGrid, ready: false },
  { id: 'kolmogorov', name: 'Prueba Kolmogorov-Smirnov',  icon: Activity,   ready: false },
  { id: 'poker',      name: 'Prueba de Póker',            icon: CheckSquare,ready: false },
];
const METHOD_BADGE: Record<string, string> = {
  midSquares:     'bg-accent text-white',
  multiplicative: 'bg-slate-700 text-white',
  monteCarlo:     'bg-emerald-600 text-white',
};
const METHOD_SHORT: Record<string, string> = {
  midSquares: 'C.M.', multiplicative: 'MULT', monteCarlo: 'M.C.',
};
const Z_LABEL: Record<string, string> = {
  '0.01': '2.576', '0.05': '1.96', '0.10': '1.645',
};

function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const tooltipStyle = {
  fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 0,
  backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

// ── Normal PDF (para campana de Gauss) ────────────────────────
function normalPDF(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

// ── Bell Curve Chart ──────────────────────────────────────────
function BellCurveChart({ result }: { result: MeansResult }) {
  const { mean, lowerLimit, upperLimit } = result;
  const mu     = 0.5;
  const sigma  = 1 / result.sqrtFactor;
  const passed = mean >= lowerLimit && mean <= upperLimit;
  const meanColor = passed ? '#16a34a' : '#dc2626';

  const { data, xMin, xMax } = useMemo(() => {
    const POINTS = 350;
    const r  = 4.5 * sigma;
    const x0 = mu - r, x1 = mu + r;
    const d  = Array.from({ length: POINTS }, (_, i) => {
      const x = x0 + (i / (POINTS - 1)) * (x1 - x0);
      return { x: +x.toFixed(6), y: +normalPDF(x, mu, sigma).toFixed(6) };
    });
    return { data: d, xMin: x0, xMax: x1 };
  }, [mu, sigma]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 28, right: 28, left: 0, bottom: 8 }}>
        <ReferenceArea x1={xMin}       x2={lowerLimit} fill="#fee2e2" fillOpacity={0.65} ifOverflow="hidden" />
        <ReferenceArea x1={lowerLimit} x2={upperLimit} fill="#dcfce7" fillOpacity={0.65} ifOverflow="hidden" />
        <ReferenceArea x1={upperLimit} x2={xMax}       fill="#fee2e2" fillOpacity={0.65} ifOverflow="hidden" />
        <XAxis dataKey="x" type="number" domain={[xMin, xMax]} scale="linear" tickCount={7}
          tickFormatter={(v) => (+v).toFixed(3)}
          tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'ui-monospace,monospace' }}
          axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis hide domain={[0, 'auto']} />
        <Tooltip formatter={(v: any) => [typeof v === 'number' ? v.toFixed(5) : '', 'f(x)']}
          labelFormatter={(x) => `x = ${(+x).toFixed(5)}`}
          contentStyle={tooltipStyle} itemStyle={{ color: '#4f46e5' }}
          cursor={{ stroke: '#c7d2fe', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey="y" stroke="#4f46e5" strokeWidth={2.5}
          fill="#eef2ff" fillOpacity={0.55} dot={false}
          animationDuration={900} animationEasing="ease-out" />
        <ReferenceLine x={0.5} stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={1.5}
          label={{ value: 'μ=0.5', position: 'insideTopRight', fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
        <ReferenceLine x={lowerLimit} stroke="#059669" strokeDasharray="3 3" strokeWidth={1.5}
          label={{ value: `Lᵢ ${lowerLimit.toFixed(4)}`, position: 'insideTopLeft', fontSize: 9, fill: '#059669' }} />
        <ReferenceLine x={upperLimit} stroke="#059669" strokeDasharray="3 3" strokeWidth={1.5}
          label={{ value: `Lₛ ${upperLimit.toFixed(4)}`, position: 'insideTopRight', fontSize: 9, fill: '#059669' }} />
        <ReferenceLine x={mean} stroke={meanColor} strokeWidth={2.5}
          label={{ value: `r̄=${mean.toFixed(4)}`, position: 'top', fontSize: 10, fill: meanColor, fontWeight: 700 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Chi-Square Chart ──────────────────────────────────────────
function ChiSquareChart({ result }: { result: VarianceResult }) {
  const { testStatistic, chiSqLower, chiSqUpper, df } = result;
  const passed    = testStatistic >= chiSqLower && testStatistic <= chiSqUpper;
  const tColor    = passed ? '#16a34a' : '#dc2626';

  const { data, xMin, xMax } = useMemo(() => {
    const POINTS = 350;
    const x0 = 0;
    const x1 = Math.max(chiSqUpper * 1.45, df * 2.5);
    const d  = Array.from({ length: POINTS }, (_, i) => {
      const x = x0 + (i / (POINTS - 1)) * (x1 - x0);
      // Avoid log(0) at x=0
      return { x: +x.toFixed(3), y: x > 1e-6 ? +chiSquarePDF(x, df).toFixed(6) : 0 };
    });
    return { data: d, xMin: x0, xMax: x1 };
  }, [df, chiSqUpper]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 28, right: 28, left: 0, bottom: 8 }}>
        <ReferenceArea x1={xMin}       x2={chiSqLower} fill="#fee2e2" fillOpacity={0.65} ifOverflow="hidden" />
        <ReferenceArea x1={chiSqLower} x2={chiSqUpper} fill="#dcfce7" fillOpacity={0.65} ifOverflow="hidden" />
        <ReferenceArea x1={chiSqUpper} x2={xMax}       fill="#fee2e2" fillOpacity={0.65} ifOverflow="hidden" />
        <XAxis dataKey="x" type="number" domain={[xMin, xMax]} scale="linear" tickCount={8}
          tickFormatter={(v) => (+v).toFixed(1)}
          tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'ui-monospace,monospace' }}
          axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis hide domain={[0, 'auto']} />
        <Tooltip formatter={(v: any) => [typeof v === 'number' ? v.toFixed(6) : '', 'f(χ²)']}
          labelFormatter={(x) => `χ² = ${(+x).toFixed(3)}`}
          contentStyle={tooltipStyle} itemStyle={{ color: '#0891b2' }}
          cursor={{ stroke: '#a5f3fc', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey="y" stroke="#0891b2" strokeWidth={2.5}
          fill="#ecfeff" fillOpacity={0.55} dot={false}
          animationDuration={900} animationEasing="ease-out" />
        <ReferenceLine x={chiSqLower} stroke="#059669" strokeDasharray="3 3" strokeWidth={1.5}
          label={{ value: `χ²ₗ ${chiSqLower.toFixed(2)}`, position: 'insideTopLeft', fontSize: 9, fill: '#059669' }} />
        <ReferenceLine x={chiSqUpper} stroke="#059669" strokeDasharray="3 3" strokeWidth={1.5}
          label={{ value: `χ²ᵤ ${chiSqUpper.toFixed(2)}`, position: 'insideTopRight', fontSize: 9, fill: '#059669' }} />
        <ReferenceLine x={testStatistic} stroke={tColor} strokeWidth={2.5}
          label={{ value: `T=${testStatistic.toFixed(2)}`, position: 'top', fontSize: 10, fill: tColor, fontWeight: 700 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Sequence Chart ────────────────────────────────────────────
function SequenceChart({ numbers, lowerLimit, upperLimit, mean, meanColor }: {
  numbers: GeneratedNumber[];
  lowerLimit: number;
  upperLimit: number;
  mean: number;
  meanColor: string;
}) {
  const data = useMemo(
    () => numbers.map((n, i) => ({ n: i + 1, ri: +n.value.toFixed(4) })),
    [numbers],
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
        <ReferenceArea y1={lowerLimit} y2={upperLimit} fill="#dcfce7" fillOpacity={0.55} />
        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="n"
          tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'ui-monospace,monospace' }}
          axisLine={{ stroke: '#e2e8f0' }} tickLine={false}
          label={{ value: 'N', position: 'insideBottomRight', fontSize: 10, fill: '#94a3b8', offset: -4 }} />
        <YAxis domain={[0, 1]}
          tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'ui-monospace,monospace' }}
          axisLine={false} tickLine={false} tickCount={6} width={36} />
        <Tooltip formatter={(v: any) => [typeof v === 'number' ? v.toFixed(4) : '', 'Rᵢ']}
          labelFormatter={(n) => `N = ${n}`}
          contentStyle={tooltipStyle} itemStyle={{ color: '#4f46e5' }}
          cursor={{ stroke: '#c7d2fe', strokeWidth: 1 }} />
        <ReferenceLine y={0.5}        stroke="#cbd5e1" strokeDasharray="5 4"  strokeWidth={1} />
        <ReferenceLine y={lowerLimit} stroke="#059669" strokeDasharray="3 3"  strokeWidth={1} />
        <ReferenceLine y={upperLimit} stroke="#059669" strokeDasharray="3 3"  strokeWidth={1} />
        <ReferenceLine y={mean}       stroke={meanColor} strokeDasharray="4 4" strokeWidth={1.5}
          label={{ value: 'r̄', position: 'insideTopRight', fontSize: 10, fill: meanColor, fontWeight: 700 }} />
        <Line type="linear" dataKey="ri" stroke="#c7d2fe" strokeWidth={1}
          dot={{ r: 2.5, fill: '#4f46e5', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
          animationDuration={700} animationEasing="ease-out" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Advanced Stats ────────────────────────────────────────────
function AdvancedStats({ riValues }: { riValues: number[] }) {
  const n       = riValues.length;
  const mean    = riValues.reduce((s, r) => s + r, 0) / n;
  const min     = Math.min(...riValues);
  const max     = Math.max(...riValues);
  const popVar  = riValues.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
  const sampVar = riValues.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1);
  const sampStd = Math.sqrt(sampVar);
  const stats = [
    { label: 'n',              sub: '',         value: n.toString()         },
    { label: 'Mínimo',         sub: 'min(Rᵢ)',  value: min.toFixed(6)       },
    { label: 'Máximo',         sub: 'max(Rᵢ)',  value: max.toFixed(6)       },
    { label: 'Rango',          sub: 'max−min',  value: (max-min).toFixed(6) },
    { label: 'Var. pob.',      sub: 's² (÷N)',  value: popVar.toFixed(6)    },
    { label: 'Var. muestral',  sub: 'S² (÷N−1)',value: sampVar.toFixed(6)  },
    { label: 'Desv. estánd.',  sub: 'S',        value: sampStd.toFixed(6)   },
    { label: 'Var. teórica',   sub: '1/12',     value: (1/12).toFixed(6)    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="bg-slate-50 border border-slate-200 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-snug">{s.label}</p>
          <p className="text-[9px] font-mono text-slate-300 leading-snug">{s.sub}</p>
          <p className="font-mono font-black text-sm text-slate-700 tabular-nums mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Legend helper ──────────────────────────────────────────────
function LegendRow({ items }: {
  items: { color: string; dashed?: boolean; fill?: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {item.fill ? (
            <div className="w-4 h-3.5 border border-slate-200" style={{ backgroundColor: item.fill }} />
          ) : (
            <svg width="22" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="22" y2="5" stroke={item.color} strokeWidth="2"
                strokeDasharray={item.dashed ? '4 3' : undefined} />
            </svg>
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────
function StatCard({ label, value, highlight }: {
  label: string; value: string; highlight?: 'green' | 'red';
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
        : highlight === 'red'  ? 'text-red-600'
        : 'text-slate-800'
      }`}>{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Validators() {
  const navigate = useNavigate();
  const { generatedNumbers, methodUsed, setSimulationData, history } = useSimulationStore();

  const [activeTest, setActiveTest]         = useState<string>('means');
  const [alpha, setAlpha]                   = useState<string>('0.05');
  const [meansResult, setMeansResult]       = useState<MeansResult    | null>(null);
  const [varianceResult, setVarianceResult] = useState<VarianceResult | null>(null);

  const displayNumbers = generatedNumbers.filter(n => !(n as any).isSeedRow);
  const riValues       = displayNumbers.map(n => n.value);

  const clearResults = () => { setMeansResult(null); setVarianceResult(null); };

  const switchTest = (id: string) => { setActiveTest(id); clearResults(); };

  const handleRestore = (entry: HistoryEntry) => {
    if (entry.method === 'midSquares') {
      setSimulationData(generateMidSquares({ seed: entry.seed, count: entry.params.count }), 'midSquares');
    } else if (entry.method === 'multiplicative') {
      setSimulationData(generateMultiplicative({ seed: entry.seed, alfa: entry.params.alfa, count: entry.params.count }), 'multiplicative');
    } else if (entry.method === 'monteCarlo') {
      setSimulationData(generateMonteCarlo({ seed: entry.seed, a: entry.params.a, c: entry.params.c, b: entry.params.b, count: entry.params.count }), 'monteCarlo');
    }
    clearResults();
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(alpha);
    if (activeTest === 'means')    setMeansResult(testMeans(riValues, a));
    if (activeTest === 'variance') setVarianceResult(testVariance(riValues, a));
  };

  // Resultado activo
  const activeResult = activeTest === 'means' ? meansResult : activeTest === 'variance' ? varianceResult : null;
  const hasPassed    = activeResult?.passed;

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
          <button onClick={() => navigate('/generadores')}
            className="w-full bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors">
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
          <button onClick={() => navigate('/generadores')}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent border border-slate-200 hover:border-accent px-3 py-2 transition-colors">
            Ir al Laboratorio
          </button>
        </div>
        <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
          <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-slate-50 gap-2">
            <History size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Historial de Simulaciones</h3>
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
                <button onClick={() => handleRestore(entry)}
                  className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 border border-accent text-accent hover:bg-accent hover:text-white transition-colors">
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

      {/* Config + Reporte + Tabla */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Panel izquierdo */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 flex-shrink-0">

          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 size={16} /> Selección de Prueba
            </h2>
            <div className="flex flex-col gap-2">
              {VALIDATION_TESTS.map((test) => (
                <button key={test.id}
                  onClick={() => { if (test.ready) switchTest(test.id); }}
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

          <form onSubmit={handleValidate} className="bg-white border border-slate-300 p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={16} /> Parámetros de Evaluación
            </h2>
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Nivel de Significancia <InlineMath math="\alpha" />
              </label>
              <select value={alpha} onChange={(e) => setAlpha(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none">
                <option value="0.01">0.01 (99% Confianza)</option>
                <option value="0.05">0.05 (95% Confianza)</option>
                <option value="0.10">0.10 (90% Confianza)</option>
              </select>
            </div>

            {/* Criterio de aceptación — Medias */}
            {activeTest === 'means' && (
              <div className="bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Criterio</p>
                <InlineMath math={`L_I \\leq \\bar{r} \\leq L_S`} />
                <p className="text-[10px] font-mono text-slate-400 mt-1">Z<sub>α/2</sub> = {Z_LABEL[alpha] ?? '?'} · n = {displayNumbers.length}</p>
              </div>
            )}

            {/* Criterio de aceptación — Varianza */}
            {activeTest === 'variance' && (
              <div className="bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Criterio</p>
                <InlineMath math={`L_I \\leq S^2 \\leq L_S`} />
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  χ²({alpha === '0.05' ? '0.025' : alpha === '0.01' ? '0.005' : '0.05'}, {displayNumbers.length - 1}) · n = {displayNumbers.length}
                </p>
              </div>
            )}

            <button type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors">
              <Play size={18} fill="currentColor" />
              Ejecutar Validación
            </button>
          </form>
        </div>

        {/* Panel derecho */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">

          {/* Reporte numérico */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col">
            <div className="border-b border-slate-300 p-4 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reporte Analítico</h3>
              {activeResult && (
                <div className={`flex items-center gap-2 px-3 py-1.5 font-black text-sm border ${
                  hasPassed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {hasPassed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {hasPassed ? 'APROBADO' : 'RECHAZADO'}
                </div>
              )}
            </div>

            {!activeResult ? (
              <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                <LayoutGrid size={40} className="mb-3 text-slate-200" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-400">Seleccione una prueba y pulse Ejecutar Validación</p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-5">

                {/* ─ Reporte de Medias ─ */}
                {activeTest === 'means' && meansResult && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard label="Promedio (r̄)"    value={meansResult.mean.toFixed(7)}          highlight={meansResult.passed ? 'green' : 'red'} />
                      <StatCard label={`√(12·${meansResult.n})`} value={meansResult.sqrtFactor.toFixed(7)} />
                      <StatCard label="L. Inferior (Lᵢ)" value={meansResult.lowerLimit.toFixed(8)} />
                      <StatCard label="L. Superior (Lₛ)" value={meansResult.upperLimit.toFixed(8)} />
                    </div>
                    <div className={`p-4 border text-sm font-semibold leading-relaxed ${
                      meansResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {meansResult.passed
                        ? `La secuencia aprueba la Prueba de Medias con α = ${meansResult.alpha}. El promedio r̄ = ${meansResult.mean.toFixed(4)} se encuentra dentro del intervalo de aceptación [${meansResult.lowerLimit.toFixed(4)}, ${meansResult.upperLimit.toFixed(4)}].`
                        : `La secuencia no aprueba la Prueba de Medias con α = ${meansResult.alpha}. El promedio r̄ = ${meansResult.mean.toFixed(4)} cae fuera del intervalo de aceptación [${meansResult.lowerLimit.toFixed(4)}, ${meansResult.upperLimit.toFixed(4)}].`
                      }
                    </div>
                  </>
                )}

                {/* ─ Reporte de Varianza ─ */}
                {activeTest === 'variance' && varianceResult && (
                  <>
                    {/* Fila 1: parámetros de entrada — igual que el Excel */}
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      <StatCard label="α"        value={varianceResult.alpha.toFixed(2)} />
                      <StatCard label="α/2"      value={(varianceResult.alpha / 2).toFixed(3)} />
                      <StatCard label="1 − α/2"  value={(1 - varianceResult.alpha / 2).toFixed(3)} />
                      <StatCard label="Z (ref.)" value={Z_LABEL[varianceResult.alpha.toFixed(2)] ?? '—'} />
                      <StatCard label="N"        value={varianceResult.n.toString()} />
                      <StatCard label="Coe inf"  value={varianceResult.chiSqUpper.toFixed(7)} />
                      <StatCard label="Coe sup"  value={varianceResult.chiSqLower.toFixed(7)} />
                    </div>

                    {/* Fila 2: varianza y límites */}
                    <div className="grid grid-cols-3 gap-3">
                      <StatCard
                        label="Varianza S²"
                        value={varianceResult.sampleVariance.toFixed(8)}
                        highlight={varianceResult.passed ? 'green' : 'red'}
                      />
                      {/* LI en Excel = upperLimit matemático, etiqueta "SUP" */}
                      <div className={`border p-3 bg-slate-50 border-slate-200`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">LI</p>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-1.5 py-0.5">SUP</span>
                        </div>
                        <p className="font-mono font-black text-sm tabular-nums text-slate-800">{varianceResult.upperLimit.toFixed(8)}</p>
                      </div>
                      {/* LS en Excel = lowerLimit matemático, etiqueta "INF" */}
                      <div className={`border p-3 bg-slate-50 border-slate-200`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">LS</p>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-1.5 py-0.5">INF</span>
                        </div>
                        <p className="font-mono font-black text-sm tabular-nums text-slate-800">{varianceResult.lowerLimit.toFixed(8)}</p>
                      </div>
                    </div>

                    <div className={`p-4 border text-sm font-semibold leading-relaxed ${
                      varianceResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {varianceResult.passed
                        ? `La secuencia aprueba la Prueba de Varianza con α = ${varianceResult.alpha}. La varianza muestral S² = ${varianceResult.sampleVariance.toFixed(4)} se encuentra dentro del intervalo de aceptación [LS = ${varianceResult.lowerLimit.toFixed(4)}, LI = ${varianceResult.upperLimit.toFixed(4)}].`
                        : `La secuencia no aprueba la Prueba de Varianza con α = ${varianceResult.alpha}. La varianza muestral S² = ${varianceResult.sampleVariance.toFixed(4)} cae fuera del intervalo de aceptación [LS = ${varianceResult.lowerLimit.toFixed(4)}, LI = ${varianceResult.upperLimit.toFixed(4)}].`
                      }
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Tabla de secuencia */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col">
            <div className="border-b border-slate-300 p-4 bg-slate-50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Secuencia de Entrada</h3>
              <span className="text-xs text-slate-400 font-bold">{displayNumbers.length} números</span>
            </div>
            <div className="overflow-auto max-h-56">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-center text-white/60 w-20">N</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-center">Rᵢ</th>
                  </tr>
                </thead>
                <tbody>
                  {displayNumbers.map((num, idx) => (
                    <tr key={num.iteration} className={`border-b border-slate-100 transition-colors ${
                      idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'
                    }`}>
                      <td className="px-4 py-2 text-center font-mono font-bold text-sm text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2 text-center font-mono font-black text-sm text-accent tabular-nums">
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

      {/* ── Análisis Gráfico ──────────────────────────────────── */}
      {activeResult && (
        <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
          <div className="border-b border-slate-300 px-6 py-4 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Análisis Gráfico</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeTest === 'means' ? 'Prueba de Medias' : 'Prueba de Varianza'} · n = {displayNumbers.length} · α = {alpha}
            </span>
          </div>

          <div className="p-6 flex flex-col gap-8">

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* Gráfica de distribución */}
              <div className="lg:col-span-3">
                {activeTest === 'means' && meansResult && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Distribución de muestreo de{' '}
                      <InlineMath math="\bar{r} \sim \mathcal{N}\!\left(0.5,\,\tfrac{1}{\sqrt{12n}}\right)" />
                    </p>
                    <BellCurveChart result={meansResult} />
                    <LegendRow items={[
                      { fill: '#dcfce7', color: '#059669', label: 'Zona de aceptación' },
                      { fill: '#fee2e2', color: '#ef4444', label: 'Zona de rechazo' },
                      { color: meansResult.passed ? '#16a34a' : '#dc2626', label: 'r̄ muestral' },
                      { color: '#94a3b8', dashed: true, label: 'μ = 0.5 (teórica)' },
                      { color: '#059669', dashed: true, label: 'Lᵢ / Lₛ' },
                    ]} />
                  </>
                )}
                {activeTest === 'variance' && varianceResult && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Distribución Chi-Cuadrada{' '}
                      <InlineMath math={`\\chi^2(${varianceResult.df})`} />
                    </p>
                    <ChiSquareChart result={varianceResult} />
                    <LegendRow items={[
                      { fill: '#dcfce7', color: '#059669', label: 'Zona de aceptación' },
                      { fill: '#fee2e2', color: '#ef4444', label: 'Zona de rechazo' },
                      { color: varianceResult.passed ? '#16a34a' : '#dc2626', label: `T = ${varianceResult.testStatistic.toFixed(2)}` },
                      { color: '#059669', dashed: true, label: 'χ²ₗ / χ²ᵤ' },
                    ]} />
                  </>
                )}
              </div>

              {/* Secuencia Rᵢ */}
              <div className="lg:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Secuencia Rᵢ por iteración
                </p>
                {activeTest === 'means' && meansResult && (
                  <>
                    <SequenceChart
                      numbers={displayNumbers}
                      lowerLimit={meansResult.lowerLimit}
                      upperLimit={meansResult.upperLimit}
                      mean={meansResult.mean}
                      meanColor={meansResult.passed ? '#16a34a' : '#dc2626'}
                    />
                    <LegendRow items={[
                      { fill: '#dcfce7', color: '#059669', label: 'Banda [Lᵢ, Lₛ]' },
                      { color: '#4f46e5', label: 'Rᵢ' },
                      { color: meansResult.passed ? '#16a34a' : '#dc2626', dashed: true, label: 'r̄' },
                    ]} />
                  </>
                )}
                {activeTest === 'variance' && varianceResult && (
                  <>
                    <SequenceChart
                      numbers={displayNumbers}
                      lowerLimit={varianceResult.lowerLimit}
                      upperLimit={varianceResult.upperLimit}
                      mean={riValues.reduce((s, r) => s + r, 0) / riValues.length}
                      meanColor={varianceResult.passed ? '#16a34a' : '#dc2626'}
                    />
                    <LegendRow items={[
                      { fill: '#dcfce7', color: '#059669', label: 'Banda [Lᵢ, Lₛ]' },
                      { color: '#4f46e5', label: 'Rᵢ' },
                      { color: varianceResult.passed ? '#16a34a' : '#dc2626', dashed: true, label: 'r̄' },
                    ]} />
                  </>
                )}
              </div>
            </div>

            {/* Estadísticos descriptivos */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Estadísticos Descriptivos
              </p>
              <AdvancedStats riValues={riValues} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
