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

// Check if we're on the client side
const isClient = typeof window !== "undefined";

// Get stored locale from localStorage if available
const getStoredLocale = (): string | null => {
  if (isClient) {
    return localStorage.getItem("preferred-locale");
  }
  return null;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: getStoredLocale() || undefined, // Use stored locale if available
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

export type SupportedLocale = keyof typeof resources;

export const supportedLocales: SupportedLocale[] = Object.keys(
  resources
) as SupportedLocale[];

// Helper to get the initial locale without causing hydration issues
export const getInitialLocale = (): SupportedLocale => {
  if (isClient) {
    const stored = localStorage.getItem("preferred-locale");
    if (stored && supportedLocales.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
  }
  return "en";
};
