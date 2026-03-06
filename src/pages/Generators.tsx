import { useState } from 'react';
import { Settings2, Play, Hash, ListOrdered, Maximize, Activity, Calculator } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

// Definicion de los metodos disponibles en el sistema
const GENERATION_METHODS = [
  { id: 'midSquares', name: 'Cuadrados Medios', icon: Maximize },
  { id: 'multiplicative', name: 'Congruencial Multiplicativo', icon: Hash },
  { id: 'monteCarlo', name: 'Simulación Monte Carlo', icon: Activity },
];

export default function Generators() {
  // Estado local para manejar la UI de seleccion
  const [activeMethod, setActiveMethod] = useState<string>('midSquares');
  
  // Estado global para futura conexion con la logica matematica
  const { setSimulationData } = useSimulationStore();

  // Estados de los parametros de entrada
  const [seed, setSeed] = useState<string>('');
  const [iterations, setIterations] = useState<string>('100');
  const [multiplier, setMultiplier] = useState<string>('');
  const [modulus, setModulus] = useState<string>('');

  // Manejador del evento de generacion
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Conectar con src/core/generators/...
    console.log('Generando secuencias para:', activeMethod);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Encabezado de la seccion */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-none shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Calculator size={24} className="text-indigo-600" />
            Laboratorio de Generación
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Configure los parametros iniciales para la generacion de numeros pseudoaleatorios.
          </p>
        </div>
      </div>

      {/* Contenedor principal de dos columnas */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* COLUMNA IZQUIERDA: Configuracion */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Tarjeta de Seleccion de Metodo */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 size={16} />
              Algoritmo
            </h2>
            <div className="flex flex-col gap-2">
              {GENERATION_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveMethod(method.id)}
                  className={`flex items-center gap-3 w-full p-3 text-left text-sm font-semibold transition-colors border ${
                    activeMethod === method.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <method.icon size={18} />
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta de Parametros */}
          <form onSubmit={handleGenerate} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ListOrdered size={16} />
              Parámetros de Entrada
            </h2>

            {/* Campos dinamicos dependiendo del metodo seleccionado */}
            <div className="space-y-4">
              
              {/* Semilla (Aplica para todos) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Semilla (X₀)</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Ej. 1234"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  required
                />
              </div>

              {/* Parametros exclusivos del metodo Multiplicativo */}
              {activeMethod === 'multiplicative' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Multiplicador (a)</label>
                    <input
                      type="number"
                      value={multiplier}
                      onChange={(e) => setMultiplier(e.target.value)}
                      placeholder="Ej. 5"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Módulo (m)</label>
                    <input
                      type="number"
                      value={modulus}
                      onChange={(e) => setModulus(e.target.value)}
                      placeholder="Ej. 32"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Cantidad de iteraciones (Aplica para todos) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Iteraciones (n)</label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(e.target.value)}
                  placeholder="Ej. 100"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-indigo-600 transition-colors"
            >
              <Play size={18} fill="currentColor" />
              Ejecutar Simulación
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Visualizacion de Datos (Placeholder temporal) */}
        <div className="w-full lg:w-2/3 bg-white border border-slate-200 p-0 shadow-sm flex flex-col">
          <div className="border-b border-slate-200 p-4 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Resultados de la Ejecución
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <Activity size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-500">Esperando parámetros</p>
            <p className="text-sm mt-2 text-center max-w-sm">
              Ingrese la semilla y configure el algoritmo en el panel izquierdo para visualizar la tabla iterativa paso a paso.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}