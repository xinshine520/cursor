import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale } from '../locales';

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'zh', // 默认中文
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'db-query-locale',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
