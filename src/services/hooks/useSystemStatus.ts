import { create } from 'zustand';

type CapabilityMap = Record<string, boolean>;

interface SystemStatusState {
  capabilities: CapabilityMap | null;
  setCapabilities: (capabilities: CapabilityMap | null) => void;
  mergeCapabilities: (capabilities: CapabilityMap) => void;
}

export const useSystemStatusStore = create<SystemStatusState>((set) => ({
  capabilities: null,
  setCapabilities: (capabilities) => set({ capabilities }),
  mergeCapabilities: (capabilities) =>
    set((state) => ({
      capabilities: {
        ...(state.capabilities ?? {}),
        ...capabilities,
      },
    })),
}));

export function useCapability(name: string): boolean {
  const capabilities = useSystemStatusStore((state) => state.capabilities);
  return capabilities?.[name] ?? false;
}
