import { create } from 'zustand';

import type { PlaybackRate } from '@/lib/race/playback';

/** tv: trackside broadcast cameras; chase: behind the car; heli: overhead follow; orbit: free. */
export type CameraMode = 'tv' | 'chase' | 'heli' | 'orbit';

interface RaceState {
  selectedDriverId: string | null;
  cameraMode: CameraMode;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  selectDriver: (driverId: string) => void;
  clearSelection: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlaying: () => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  /** Back to defaults when a different race is loaded. */
  resetForNewRace: () => void;
}

const DEFAULT_RATE: PlaybackRate = 1;

export const useRaceStore = create<RaceState>((set) => ({
  selectedDriverId: null,
  cameraMode: 'tv',
  isPlaying: true,
  playbackRate: DEFAULT_RATE,
  selectDriver: (driverId): void => set({ selectedDriverId: driverId }),
  clearSelection: (): void => set({ selectedDriverId: null }),
  setCameraMode: (mode): void => set({ cameraMode: mode }),
  setPlaying: (isPlaying): void => set({ isPlaying }),
  togglePlaying: (): void => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackRate: (rate): void => set({ playbackRate: rate }),
  resetForNewRace: (): void =>
    set({ selectedDriverId: null, isPlaying: true, playbackRate: DEFAULT_RATE }),
}));
