import { useLocaleStore } from '../stores/localeStore';
import { translations } from '../locales';
import type { Translations } from '../locales';

export function useTranslation() {
  const { locale } = useLocaleStore();
  const t = translations[locale];

  return {
    t,
    locale,
  };
}
