import { create } from 'zustand';
import type { GeneratedNumber, HistoryEntry } from '../types/simulation';

interface SimulationState {
  generatedNumbers: GeneratedNumber[];
  methodUsed: string | null;
  isSimulationActive: boolean;
  history: HistoryEntry[];

  setSimulationData: (numbers: GeneratedNumber[], method: string) => void;
  clearSimulation: () => void;
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  generatedNumbers: [],
  methodUsed: null,
  isSimulationActive: false,
  history: [],

  setSimulationData: (numbers, method) => set({
    generatedNumbers: numbers,
    methodUsed: method,
    isSimulationActive: true,
  }),

  clearSimulation: () => set({
    generatedNumbers: [],
    methodUsed: null,
    isSimulationActive: false,
  }),

  addToHistory: (entry) => set((state) => ({
    history: [...state.history, entry],
  })),

  clearHistory: () => set({ history: [] }),
}));