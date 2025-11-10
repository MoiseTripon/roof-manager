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

// Disable detection during SSR to prevent hydration mismatches
const isClient = typeof window !== "undefined";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: "en", // Always start with "en" to ensure consistency
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Disable detection during initialization
      lookupLocalStorage: isClient ? "preferred-locale" : undefined,
      order: isClient ? ["localStorage", "navigator", "htmlTag"] : [],
      caches: isClient ? ["localStorage"] : [],
    },
    react: {
      useSuspense: false, // Prevent suspense-based hydration issues
    },
  });

export default i18n;

export type SupportedLocale = keyof typeof resources;

export const supportedLocales: SupportedLocale[] = Object.keys(
  resources
) as SupportedLocale[];
