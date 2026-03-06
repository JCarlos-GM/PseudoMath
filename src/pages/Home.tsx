import { ArrowRight, Dna, CheckCircle2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col justify-center items-center gap-12 py-10">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Herramienta Interactiva v1.0
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800">
          Matemática que se <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">entiende.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light">
          Genera, valida y comprende el comportamiento de los números pseudoaleatorios con retroalimentación visual paso a paso. Diseñado para dominar la teoría de simulación.
        </p>
      </div>

      {/* Bento Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
        
        {/* Card 1 */}
        <button 
          onClick={() => navigate('/generadores')}
          className="group text-left bg-white/60 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
            <Dna className="text-indigo-600 group-hover:text-white transition-colors" size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Generadores</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Método Multiplicativo, Cuadrados Medios y Monte Carlo con visualización iterativa.
          </p>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-4 transition-all">
            Empezar a generar <ArrowRight size={16} />
          </div>
        </button>

        {/* Card 2 */}
        <button 
          onClick={() => navigate('/validadores')}
          className="group text-left bg-white/60 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="bg-cyan-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500 transition-all duration-300">
            <CheckCircle2 className="text-cyan-600 group-hover:text-white transition-colors" size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Pruebas de Bondad</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Valida la uniformidad e independencia con Chi-Cuadrada, Kolmogorov, Poker y más.
          </p>
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-sm group-hover:gap-4 transition-all">
            Validar datos <ArrowRight size={16} />
          </div>
        </button>

        {/* Card 3 */}
        <button 
          onClick={() => navigate('/teoria')}
          className="group text-left bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
          <div className="bg-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 relative z-10">
            <BookOpen className="text-indigo-400 group-hover:text-white transition-colors" size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">El Pizarrón</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">
            Conceptos teóricos, fórmulas matemáticas y condiciones para elegir semillas y módulos.
          </p>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:gap-4 transition-all relative z-10">
            Leer teoría <ArrowRight size={16} />
          </div>
        </button>

      </div>
    </div>
  );
}