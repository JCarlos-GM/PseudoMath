import { create } from 'zustand';
import type { GeneratedNumber } from '../types/simulation';

// Define la estructura estricta del estado global y sus acciones
interface SimulationState {
  // Almacenamiento de datos
  generatedNumbers: GeneratedNumber[];
  methodUsed: string | null;
  isSimulationActive: boolean;

  // Mutadores del estado (Acciones)
  setSimulationData: (numbers: GeneratedNumber[], method: string) => void;
  clearSimulation: () => void;
}

// Inicializacion del store usando Zustand
export const useSimulationStore = create<SimulationState>((set) => ({
  // Valores iniciales por defecto al cargar la aplicacion
  generatedNumbers: [],
  methodUsed: null,
  isSimulationActive: false,

  // Actualiza el estado global con los nuevos numeros calculados
  // Se llama despues de ejecutar cualquier metodo generador
  setSimulationData: (numbers, method) => set({
    generatedNumbers: numbers,
    methodUsed: method,
    isSimulationActive: true
  }),

  // Restablece el estado a sus valores iniciales
  // Util para cuando el usuario desea iniciar un nuevo analisis desde cero
  clearSimulation: () => set({
    generatedNumbers: [],
    methodUsed: null,
    isSimulationActive: false
  })
}));