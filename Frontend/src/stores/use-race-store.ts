import { create } from 'zustand';

interface RaceState {
  selectedDriverId: string | null;
  selectDriver: (driverId: string) => void;
  clearSelection: () => void;
}

export const useRaceStore = create<RaceState>((set) => ({
  selectedDriverId: null,
  selectDriver: (driverId): void => set({ selectedDriverId: driverId }),
  clearSelection: (): void => set({ selectedDriverId: null }),
}));
