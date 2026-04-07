import { create } from 'zustand';

const WS_HEALTH_WINDOW_MS = 30_000;

interface ConnectionState {
  lastWsMessageAt: number | null;
  recordWsMessage: () => void;
  isWsHealthy: () => boolean;
  getHeartbeatAgeMs: () => number | null;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  lastWsMessageAt: null,
  recordWsMessage: () => set({ lastWsMessageAt: Date.now() }),
  isWsHealthy: () => {
    const lastWsMessageAt = get().lastWsMessageAt;
    return lastWsMessageAt !== null && Date.now() - lastWsMessageAt <= WS_HEALTH_WINDOW_MS;
  },
  getHeartbeatAgeMs: () => {
    const lastWsMessageAt = get().lastWsMessageAt;
    if (lastWsMessageAt === null) {
      return null;
    }
    return Date.now() - lastWsMessageAt;
  },
}));
