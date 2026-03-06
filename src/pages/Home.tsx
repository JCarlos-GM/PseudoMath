import { ArrowRight, Dna, CheckSquare, BookOpen, Calculator, Sparkles, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col justify-center items-center py-4">
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-6 mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-semibold mb-2 hover:shadow-md transition-shadow cursor-default">
          <Sparkles size={16} className="text-indigo-500" />
          <span>Plataforma de Simulación v1.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800">
          Domina los números <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
            pseudoaleatorios.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
          Una suite completa para generar secuencias complejas y someterlas a las pruebas estadísticas más rigurosas de la industria.
        </p>
      </div>

      {/* Bento Grid (Asimétrico x10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 w-full max-w-5xl">
        
        {/* CARD 1: Laboratorio (Ocupa 2 columnas) */}
        <button 
          onClick={() => navigate('/generadores')}
          className="group relative md:col-span-2 md:row-span-1 text-left bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
            <Calculator size={180} className="text-indigo-600 -rotate-12 translate-x-10 -translate-y-10" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
                <Dna className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Laboratorio de Generación</h3>
              <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                Configura semillas, módulos y multiplicadores para métodos de Cuadrados Medios, Congruencial Lineal y Monte Carlo.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 w-fit px-4 py-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Iniciar simulación <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* CARD 2: Validadores (Ocupa 1 columna) */}
        <button 
          onClick={() => navigate('/validadores')}
          className="group relative md:col-span-1 md:row-span-1 text-left bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          
          <div className="relative z-10">
            <div className="bg-slate-700/50 border border-slate-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <CheckSquare className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pruebas de Bondad</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Evalúa la uniformidad e independencia de tus datos generados usando pruebas rigurosas.
            </p>
            
            {/* Falso mini-gráfico */}
            <div className="flex items-end gap-1.5 h-12 mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              {[40, 70, 45, 90, 65, 85].map((h, i) => (
                <div key={i} className="w-full bg-cyan-400/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </button>

        {/* CARD 3: Teoría */}
        <button 
          onClick={() => navigate('/teoria')}
          className="group relative md:col-span-1 md:row-span-1 text-left bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
            <BookOpen className="text-amber-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">El Pizarrón</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Consulta las fórmulas, condiciones de Hull-Dobell y la teoría detrás de cada algoritmo estadístico.
          </p>
          <div className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Leer apuntes <ArrowRight size={16} />
          </div>
        </button>

        {/* CARD 4: Métricas Rápidas (Span 2) */}
        <div className="md:col-span-2 md:row-span-1 bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <BarChart3 className="text-emerald-600" size={20} />
            </div>
            <div>
              <h4 className="text-slate-800 font-bold">Estado del Sistema</h4>
              <p className="text-slate-500 text-sm">Listo para procesar hasta 100,000 iteraciones</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-2">
            <div className="flex-1 bg-white/60 rounded-xl p-4 border border-slate-100">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Pruebas Disponibles</div>
              <div className="text-2xl font-black text-slate-700">6</div>
            </div>
            <div className="flex-1 bg-white/60 rounded-xl p-4 border border-slate-100">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Generadores</div>
              <div className="text-2xl font-black text-slate-700">3</div>
            </div>
            <div className="flex-1 bg-white/60 rounded-xl p-4 border border-slate-100 hidden sm:block">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Precisión</div>
              <div className="text-2xl font-black text-slate-700">Alta</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}