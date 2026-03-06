import { ArrowRight, Dna, CheckSquare, BookOpen, ExternalLink, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // Matriz de configuracion para aplicaciones externas
  // Facilita la escalabilidad si se desarrollan mas calculadoras en el futuro
  const EXTERNAL_CALCULATORS = [
    {
      id: 'fluxsolver',
      name: 'FluxSolver',
      description: 'Calculadora de métodos numéricos para sistemas de ecuaciones lineales (Jacobi, Gauss-Seidel).',
      url: '#', // TODO: Insertar URL de despliegue real
      status: 'Operativo',
      theme: 'bg-slate-900 text-white'
    },
    {
      id: 'placeholder',
      name: 'Módulo Simplex',
      description: 'Herramienta de investigación de operaciones para maximización y minimización lineal.',
      url: '#',
      status: 'En Desarrollo',
      theme: 'bg-slate-100 text-slate-500'
    }
  ];

  return (
    <div className="h-full flex flex-col items-center py-8 gap-12">
      
      {/* SECCION 1: Encabezado Principal (Flat Design estricto) */}
      <div className="text-center max-w-4xl space-y-4">
        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest mb-4">
          PseudoMath v1.0
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
          Análisis de Números Pseudoaleatorios
        </h1>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Suite de generación algorítmica y validación estadística para modelos de simulación matemática.
        </p>
      </div>

      {/* SECCION 2: Modulos Nativos (Herramientas de esta app) */}
      <div className="w-full max-w-5xl">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
          Módulos Internos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tarjeta de Generadores */}
          <button 
            onClick={() => navigate('/generadores')}
            className="group flex flex-col text-left bg-white border border-slate-300 p-6 hover:border-slate-900 transition-colors"
          >
            <div className="bg-slate-100 w-12 h-12 flex items-center justify-center mb-6 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Dna size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Generadores</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Ejecución de algoritmos Congruenciales Lineales, Cuadrados Medios y Monte Carlo.
            </p>
            <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
              Ingresar al laboratorio <ArrowRight size={16} />
            </div>
          </button>

          {/* Tarjeta de Validadores */}
          <button 
            onClick={() => navigate('/validadores')}
            className="group flex flex-col text-left bg-white border border-slate-300 p-6 hover:border-slate-900 transition-colors"
          >
            <div className="bg-slate-100 w-12 h-12 flex items-center justify-center mb-6 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Validación Estadística</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Pruebas de bondad de ajuste: Chi-Cuadrada, Kolmogorov-Smirnov, Póker y Varianza.
            </p>
            <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
              Ejecutar pruebas <ArrowRight size={16} />
            </div>
          </button>

          {/* Tarjeta de Teoria */}
          <button 
            onClick={() => navigate('/teoria')}
            className="group flex flex-col text-left bg-white border border-slate-300 p-6 hover:border-slate-900 transition-colors"
          >
            <div className="bg-slate-100 w-12 h-12 flex items-center justify-center mb-6 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Marco Teórico</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Documentación matemática, fórmulas y condiciones restrictivas de los modelos.
            </p>
            <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
              Consultar documentación <ArrowRight size={16} />
            </div>
          </button>

        </div>
      </div>

      {/* SECCION 3: Ecosistema Externo (Calculadoras Independientes) */}
      <div className="w-full max-w-5xl mt-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
          <Calculator size={16} />
          Otras Herramientas del Desarrollador
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Renderizado iterativo de aplicaciones externas */}
          {EXTERNAL_CALCULATORS.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-stretch border border-slate-300 bg-white hover:border-slate-500 transition-colors group"
              onClick={(e) => app.status !== 'Operativo' && e.preventDefault()}
            >
              {/* Bloque visual lateral */}
              <div className={`w-3 flex-shrink-0 ${app.theme}`}></div>
              
              {/* Contenido de la tarjeta externa */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${
                      app.status === 'Operativo' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{app.description}</p>
                </div>
                
                {/* Indicador de enlace externo */}
                <div className={`mt-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  app.status === 'Operativo' ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {app.status === 'Operativo' ? 'Abrir aplicación externa' : 'No disponible'}
                  {app.status === 'Operativo' && <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />}
                </div>
              </div>
            </a>
          ))}
          
        </div>
      </div>

    </div>
  );
}