import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "@/lib/i18n/locales/en.json";
import esTranslation from "@/lib/i18n/locales/es.json";

export const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export type SupportedLocale = keyof typeof resources;

export const supportedLocales: SupportedLocale[] = Object.keys(
  resources
) as SupportedLocale[];
