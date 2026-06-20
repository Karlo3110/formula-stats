import { create } from 'zustand';

export type CameraMode = 'cinematic' | 'orbit';

interface RaceState {
  selectedDriverId: string | null;
  cameraMode: CameraMode;
  selectDriver: (driverId: string) => void;
  clearSelection: () => void;
  setCameraMode: (mode: CameraMode) => void;
}

export const useRaceStore = create<RaceState>((set) => ({
  selectedDriverId: null,
  cameraMode: 'cinematic',
  selectDriver: (driverId): void => set({ selectedDriverId: driverId }),
  clearSelection: (): void => set({ selectedDriverId: null }),
  setCameraMode: (mode): void => set({ cameraMode: mode }),
}));
