import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConnectionStore {
  activeConnectionId: string | null;
  setActiveConnectionId: (id: string | null) => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      activeConnectionId: null,
      setActiveConnectionId: (id) => set({ activeConnectionId: id }),
    }),
    {
      name: 'db-query-active-connection',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
