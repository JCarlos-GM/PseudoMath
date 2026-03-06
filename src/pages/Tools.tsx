import { ExternalLink, Grid3X3, ArrowRight, Calculator } from 'lucide-react';

export default function Tools() {
  // Matriz de herramientas adicionales en el ecosistema del desarrollador
  const EXTERNAL_TOOLS = [
    {
      id: 'fluxsolver',
      title: 'FluxSolver',
      category: 'Métodos Numéricos',
      description: 'Calculadora avanzada para la resolución de sistemas de ecuaciones lineales. Implementa algoritmos iterativos como Jacobi y Gauss-Seidel con análisis de convergencia.',
      icon: Grid3X3,
      url: '#', // URL de despliegue de FluxSolver
      status: 'Estable',
      color: 'bg-indigo-600'
    },
    // Espacio reservado para futuras calculadoras de la currícula de Ingeniería
    {
      id: 'placeholder',
      title: 'Módulo en Desarrollo',
      category: 'Investigación de Operaciones',
      description: 'Herramienta de optimización lineal y método Simplex. Próximamente disponible en el ecosistema.',
      icon: Calculator,
      url: '#',
      status: 'Próximamente',
      color: 'bg-slate-400'
    }
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Encabezado de la seccion (Flat Design) */}
      <div className="flex flex-col bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3 mb-2">
          <ExternalLink size={24} className="text-indigo-600" />
          Ecosistema de Herramientas
        </h1>
        <p className="text-slate-500 text-sm font-medium max-w-2xl">
          Acceda a la suite completa de calculadoras e instrumentos de análisis numérico desarrollados para complementar la teoría matemática.
        </p>
      </div>

      {/* Grid de herramientas externas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXTERNAL_TOOLS.map((tool) => (
          <div 
            key={tool.id} 
            className="flex flex-col bg-white border border-slate-200 shadow-sm hover:border-slate-400 transition-colors"
          >
            {/* Cabecera de la tarjeta */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className={`p-3 text-white flex items-center justify-center ${tool.color}`}>
                <tool.icon size={24} strokeWidth={1.5} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 border ${
                tool.status === 'Estable' 
                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
                  : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}>
                {tool.status}
              </span>
            </div>
            
            {/* Cuerpo de la tarjeta */}
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                {tool.category}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                {tool.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                {tool.description}
              </p>
              
              {/* Accion de redireccion */}
              <a 
                href={tool.url}
                className={`mt-auto flex items-center justify-between w-full p-3 text-sm font-bold transition-colors border ${
                  tool.status === 'Estable'
                    ? 'bg-slate-900 text-white hover:bg-indigo-600 border-transparent'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                onClick={(e) => tool.status !== 'Estable' && e.preventDefault()}
              >
                {tool.status === 'Estable' ? 'Abrir Aplicación' : 'No disponible'}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}