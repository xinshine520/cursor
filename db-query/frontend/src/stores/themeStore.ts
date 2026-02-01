import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggle: () => void;
}

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('db-query-theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: getInitialTheme(),
      setIsDark: (isDark) => set({ isDark }),
      toggle: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'db-query-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
