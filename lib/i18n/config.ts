import i18n from "i18next";
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

// Get initial language from cookie (works on both server and client)
function getInitialLanguage(): SupportedLocale {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/preferred-locale=([^;]+)/);
    const cookieLocale = match ? match[1] : null;

    if (
      cookieLocale &&
      supportedLocales.includes(cookieLocale as SupportedLocale)
    ) {
      return cookieLocale as SupportedLocale;
    }
  }

  return "en";
}

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: getInitialLanguage(),
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
