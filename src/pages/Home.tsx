import { useState } from 'react';
import {
  Cpu, ShieldCheck, BarChart2, BookOpen,
  ArrowRight, ExternalLink, Grid3X3, Calculator,
  ChevronLeft, ChevronRight, Sigma
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Funcionalidades del programa ─────────────────────────────
const FEATURES = [
  {
    number: '01',
    icon: Cpu,
    title: 'Generación Algorítmica',
    description: 'Implementación de los principales métodos de generación de números pseudoaleatorios utilizados en simulación estocástica.',
    tags: ['Cuadrados Medios', 'Congruencial Mult.', 'Monte Carlo'],
    path: '/generadores',
    cta: 'Abrir Laboratorio',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Validación Estadística',
    description: 'Pruebas de bondad de ajuste para verificar la aleatoriedad y uniformidad de las secuencias generadas.',
    tags: ['Chi-Cuadrada', 'Kolmogorov-Smirnov', 'Póker', 'Medias', 'Varianza'],
    path: '/validadores',
    cta: 'Ejecutar Pruebas',
  },
  {
    number: '03',
    icon: BarChart2,
    title: 'Análisis Paso a Paso',
    description: 'Trazabilidad completa de cada iteración con visualización de datos intermedios, tablas de resultados y métricas estadísticas.',
    tags: ['Tablas interactivas', 'Datos intermedios', 'Métricas'],
    path: '/generadores',
    cta: 'Ver en Acción',
  },
  {
    number: '04',
    icon: BookOpen,
    title: 'Marco Teórico',
    description: 'Documentación matemática estructurada con fórmulas, condiciones restrictivas y fundamentos de cada método.',
    tags: ['Fórmulas LaTeX', 'Condiciones', 'Referencias'],
    path: '/teoria',
    cta: 'Consultar Teoría',
  },
];

// ── Suite completa del desarrollador (carrusel) ──────────────
const SUITE = [
  {
    id: 'pseudomath',
    title: 'PseudoMath',
    category: 'Simulación Estocástica',
    description: 'Suite de generación algorítmica y validación estadística para números pseudoaleatorios.',
    icon: Sigma,
    url: '/',
    status: 'Activo',
    isInternal: true,
  },
  {
    id: 'fluxsolver',
    title: 'FluxSolver',
    category: 'Métodos Numéricos',
    description: 'Resolución de sistemas de ecuaciones lineales mediante algoritmos iterativos Jacobi y Gauss-Seidel con análisis de convergencia.',
    icon: Grid3X3,
    url: '#',
    status: 'Estable',
    isInternal: false,
  },
  {
    id: 'simplex',
    title: 'Módulo Simplex',
    category: 'Investigación de Operaciones',
    description: 'Optimización lineal con el método Simplex para maximización y minimización de funciones objetivo con restricciones.',
    icon: Calculator,
    url: '#',
    status: 'Próximamente',
    isInternal: false,
  },
];

// Dimensiones del carrusel
const CARD_SIZE = 152;   // px — tamaño de la card activa
const OFFSET    = 188;   // px — distancia entre centros de cards

export default function Home() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => Math.max(0, i - 1));
  const next = () => setActive((i) => Math.min(SUITE.length - 1, i + 1));

  const activeTool = SUITE[active];

  return (
    <div className="flex flex-col items-center py-8 gap-16">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl space-y-5">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">
          Análisis de Números<br />
          <span className="text-accent">Pseudoaleatorios</span>
        </h1>
        <p className="text-base text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Suite de generación algorítmica y validación estadística para modelos de simulación matemática.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/generadores')}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-bold px-6 py-3 hover:bg-accent transition-colors"
          >
            Comenzar simulación <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/teoria')}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold px-6 py-3 hover:border-slate-900 transition-colors"
          >
            Ver documentación
          </button>
        </div>
      </div>

      {/* ── FUNCIONALIDADES ───────────────────────────────────── */}
      <div className="w-full max-w-5xl">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Funcionalidades
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.number}
                className="group relative bg-white p-8 overflow-hidden flex flex-col gap-5 hover:bg-slate-50 transition-colors cursor-default"
              >
                {/* Número decorativo */}
                <span className="absolute -top-3 right-5 text-[7rem] font-black text-slate-100 select-none leading-none pointer-events-none group-hover:text-accent/10 transition-colors">
                  {feature.number}
                </span>

                {/* Icono + título */}
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-900 flex items-center justify-center text-white group-hover:bg-accent transition-colors">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Chips */}
                <div className="relative flex flex-wrap gap-1.5">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(feature.path)}
                  className="relative mt-auto w-fit flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent transition-colors group/cta"
                >
                  {feature.cta}
                  <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CARRUSEL DE HERRAMIENTAS ──────────────────────────── */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <p className="self-start text-xs font-bold text-slate-400 uppercase tracking-widest">
          Otras Herramientas del Desarrollador
        </p>

        {/* Fila: flecha izq + stage + flecha der */}
        <div className="flex items-center gap-4 w-full">

          {/* Flecha izquierda */}
          <button
            onClick={prev}
            disabled={active === 0}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Stage con overflow para cortar cards laterales */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ height: `${CARD_SIZE + 32}px` }}
          >
            {SUITE.map((tool, index) => {
              const Icon = tool.icon;
              const offset = index - active;
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;
              const scale = isActive ? 1 : 0.68;

              return (
                <div
                  key={tool.id}
                  className="absolute top-1/2 left-1/2 transition-all duration-300 ease-in-out"
                  style={{
                    transform: `translate(calc(-50% + ${offset * OFFSET}px), -50%) scale(${scale})`,
                    opacity: isVisible ? (isActive ? 1 : 0.55) : 0,
                    zIndex: isActive ? 10 : 5,
                    pointerEvents: isVisible ? 'auto' : 'none',
                  }}
                >
                  <div
                    onClick={() => setActive(index)}
                    className={`flex items-center justify-center cursor-pointer transition-colors duration-300 ${
                      isActive ? 'bg-accent' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{ width: CARD_SIZE, height: CARD_SIZE }}
                  >
                    <Icon
                      size={isActive ? 52 : 44}
                      strokeWidth={1}
                      className="text-white transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flecha derecha */}
          <button
            onClick={next}
            disabled={active === SUITE.length - 1}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Info del item activo */}
        <div className="text-center w-full max-w-sm transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {activeTool.category}
            </p>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
              activeTool.status === 'Activo' || activeTool.status === 'Estable'
                ? 'border-slate-900 text-slate-900'
                : 'border-slate-300 text-slate-400'
            }`}>
              {activeTool.status}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTool.title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {activeTool.description}
          </p>

          {/* CTA del item activo */}
          {activeTool.isInternal ? (
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-accent transition-colors"
            >
              Estás aquí <ArrowRight size={13} />
            </button>
          ) : activeTool.status === 'Estable' ? (
            <a
              href={activeTool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-accent transition-colors"
            >
              Abrir aplicación <ExternalLink size={13} />
            </a>
          ) : (
            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-slate-300">
              No disponible aún
            </span>
          )}
        </div>

        {/* Dots de posición */}
        <div className="flex items-center gap-2">
          {SUITE.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 h-1.5 ${
                i === active ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
