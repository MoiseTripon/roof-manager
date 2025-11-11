import i18n, { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

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

export type SupportedLocale = keyof typeof resources;

export const supportedLocales: SupportedLocale[] = Object.keys(
  resources
) as SupportedLocale[];

export function createI18nInstance(locale: SupportedLocale) {
  const instance = createInstance();

  instance.use(initReactI18next).init({
    resources,
    fallbackLng: "en",
    lng: locale, // Use the provided locale
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return instance;
}

// Default export for backward compatibility (if needed elsewhere)
const defaultI18n = createI18nInstance("en");
export default defaultI18n;
