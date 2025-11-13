import i18n, { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "es", "ro"] as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

export type Dictionary = {
  builder: {
    title: string;
    tools: {
      measure: string;
      label: string;
      select: string;
    };
    canvas: {
      loading: string;
      empty: string;
    };
    results: {
      title: string;
      distance: string;
      area: string;
      volume: string;
      unit: string;
    };
  };
  common: {
    save: string;
    cancel: string;
    reset: string;
    export: string;
  };
};

// export const resources = {
//   en: {
//     translation: enTranslation,
//   },
//   es: {
//     translation: esTranslation,
//   },
//   ro: {
//     translation: roTranslation,
//   },
// } as const;

// export type SupportedLocale = keyof typeof resources;

// export const supportedLocales: SupportedLocale[] = Object.keys(
//   resources
// ) as SupportedLocale[];

// export function createI18nInstance(locale: SupportedLocale) {
//   const instance = createInstance();

//   instance.use(initReactI18next).init({
//     resources,
//     fallbackLng: "en",
//     lng: locale, // Use the provided locale
//     debug: false,
//     interpolation: {
//       escapeValue: false,
//     },
//     react: {
//       useSuspense: false,
//     },
//   });

//   return instance;
// }

// Default export for backward compatibility (if needed elsewhere)
// const defaultI18n = createI18nInstance("en");
// export default defaultI18n;
