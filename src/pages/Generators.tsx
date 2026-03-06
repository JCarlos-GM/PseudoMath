import { useState } from 'react';
import { Settings2, Play, Hash, ListOrdered, Maximize, Activity, Calculator } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { generateMidSquares } from '../core/generators/midSquares';

// Definicion de los metodos algoritmicos disponibles
const GENERATION_METHODS = [
  { id: 'midSquares', name: 'Cuadrados Medios', icon: Maximize },
  { id: 'multiplicative', name: 'Congruencial Multiplicativo', icon: Hash },
  { id: 'monteCarlo', name: 'Simulación Monte Carlo', icon: Activity },
];

export default function Generators() {
  // Estado local para parametros de entrada
  const [activeMethod, setActiveMethod] = useState<string>('midSquares');
  const [seed, setSeed] = useState<string>('');
  const [iterations, setIterations] = useState<string>('100');
  
  // Acceso al Store global para almacenar resultados
  const { setSimulationData, generatedNumbers } = useSimulationStore();
  const [error, setError] = useState<string | null>(null);

  // Ejecucion del motor matematico
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const parsedSeed = parseInt(seed, 10);
      const parsedCount = parseInt(iterations, 10);

      if (isNaN(parsedSeed) || isNaN(parsedCount)) {
        throw new Error('Los parámetros deben ser valores numéricos.');
      }

      if (activeMethod === 'midSquares') {
        // Invocacion de la logica core (aislada del componente visual)
        const results = generateMidSquares({ seed: parsedSeed, count: parsedCount });
        
        // Almacenamiento en Zustand para disponibilidad global (Validadores)
        setSimulationData(results, activeMethod);
      } else {
        throw new Error('Algoritmo seleccionado en fase de desarrollo.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
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
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Panel Izquierdo: Configuracion */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
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
                      ? 'bg-accent text-white border-accent'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <method.icon size={18} />
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ListOrdered size={16} />
              Parámetros de Entrada
            </h2>

            {/* Manejo de excepciones visuales */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3">
                Error: {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Semilla (X₀)</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Ej. 1234 (Min. 3 dígitos)"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Iteraciones (n)</label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(e.target.value)}
                  placeholder="Ej. 100"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm p-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 hover:bg-accent transition-colors"
            >
              <Play size={18} fill="currentColor" />
              Ejecutar Simulación
            </button>
          </form>
        </div>

        {/* Panel Derecho: Tabla de Resultados Dinamica */}
        <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="border-b border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Resultados de la Ejecución
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {generatedNumbers.length} iteraciones procesadas
            </span>
          </div>
          
          <div className="flex-1 overflow-auto bg-white">
            {generatedNumbers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                <Activity size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
                <p className="text-lg font-medium text-slate-500">Esperando parámetros</p>
                <p className="text-sm mt-2 text-center max-w-sm">
                  Ingrese la semilla y configure el algoritmo en el panel izquierdo.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-bold">i</th>
                    <th className="px-6 py-3 font-bold">Xᵢ (Semilla)</th>
                    <th className="px-6 py-3 font-bold font-mono">rᵢ (Pseudoaleatorio)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedNumbers.map((row, index) => (
                    <tr key={index} className="hover:bg-accent-muted/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900">{row.iteration}</td>
                      <td className="px-6 py-3 text-slate-600">{row.seed}</td>
                      <td className="px-6 py-3 text-accent font-bold font-mono">{row.value.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}