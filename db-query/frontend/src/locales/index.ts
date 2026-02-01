import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';
export type Translations = typeof zh;

export const translations: Record<Locale, Translations> = {
  zh,
  en,
};
