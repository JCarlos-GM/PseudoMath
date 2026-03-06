import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import {
  CheckSquare,
  AlertTriangle,
  BarChart,
  Percent,
  LayoutGrid,
  Activity,
  Settings2,
  Play
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

// Definicion de las pruebas de bondad de ajuste disponibles
const VALIDATION_TESTS = [
  { id: 'means', name: 'Prueba de Medias', icon: Percent },
  { id: 'variance', name: 'Prueba de Varianza', icon: BarChart },
  { id: 'chiSquare', name: 'Prueba Chi-Cuadrada', icon: LayoutGrid },
  { id: 'kolmogorov', name: 'Prueba Kolmogorov-Smirnov', icon: Activity },
  { id: 'poker', name: 'Prueba de Póker', icon: CheckSquare },
];

export default function Validators() {
  const navigate = useNavigate();
  
  // Recuperacion de datos del estado global
  const { generatedNumbers, methodUsed } = useSimulationStore();
  
  // Estado local de la interfaz
  const [activeTest, setActiveTest] = useState<string>('means');
  const [alpha, setAlpha] = useState<string>('0.05'); // Nivel de significancia estandar

  // Si no hay datos en memoria, se muestra un estado de bloqueo
  if (generatedNumbers.length === 0) {
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

  // Manejador de la ejecucion de la prueba estadistica
  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Conectar con src/core/validators/...
    console.log(`Ejecutando ${activeTest} con alpha=${alpha} sobre ${generatedNumbers.length} datos.`);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Encabezado del Modulo */}
      <div className="flex items-center justify-between bg-white border border-slate-300 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CheckSquare size={24} className="text-accent" />
            Módulo de Validación Estadística
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Analizando muestra de <span className="font-bold text-slate-700">{generatedNumbers.length}</span> números generados vía <span className="uppercase tracking-wider text-xs font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 ml-1">{methodUsed}</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Panel Izquierdo: Seleccion de Prueba y Parametros */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Selector de Pruebas */}
          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 size={16} />
              Selección de Prueba
            </h2>
            <div className="flex flex-col gap-2">
              {VALIDATION_TESTS.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setActiveTest(test.id)}
                  className={`flex items-center gap-3 w-full p-3 text-left text-sm font-semibold transition-colors border ${
                    activeTest === test.id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                  }`}
                >
                  <test.icon size={18} />
                  {test.name}
                </button>
              ))}
            </div>
          </div>

          {/* Configuracion de Parametros Estadisticos */}
          <form onSubmit={handleValidate} className="bg-white border border-slate-300 p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={16} />
              Parámetros de Evaluación
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase flex items-center gap-1">
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

            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors"
            >
              <Play size={18} fill="currentColor" />
              Ejecutar Validación
            </button>
          </form>
        </div>

        {/* Panel Derecho: Visualizacion de Resultados (Placeholder) */}
        <div className="w-full lg:w-2/3 bg-white border border-slate-300 shadow-sm flex flex-col">
          <div className="border-b border-slate-300 p-4 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Reporte Analítico
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 bg-white">
            <LayoutGrid size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-500">Espera de Instrucción</p>
            <p className="text-sm mt-2 text-center max-w-sm">
              Seleccione una prueba en el panel lateral y establezca el nivel de significancia para calcular los estadísticos correspondientes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}