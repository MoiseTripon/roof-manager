import i18n, { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "es", "ro"] as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

export type Dictionary = {
  app: {
    title: string;
    description: string;
  };
  sections: {
    inputs: string;
    visualization: string;
    results: string;
  };
  inputs: {
    units: {
      label: string;
      imperial: string;
      metric: string;
    };
    span: {
      label: string;
      placeholder: string;
      description: string;
    };
    pitchRise: {
      label: string;
      placeholder: string;
      description: string;
    };
    pitchRun: {
      label: string;
      placeholder: string;
      description: string;
    };
    ridgeOffset: {
      label: string;
      description: string;
    };
    wallHeights: {
      label: string;
      leftWall: string;
      rightWall: string;
      description: string;
    };
    commonPitches: string;
  };
  results: {
    run: {
      title: string;
      description: string;
    };
    rise: {
      title: string;
      description: string;
    };
    ridgeHeight: {
      title: string;
      description: string;
    };
    roofRise: {
      title: string;
      description: string;
    };
    rafterLength: {
      title: string;
      description: string;
      left: string;
      right: string;
    };
    pitchAngle: {
      title: string;
      description: string;
      left: string;
      right: string;
    };
    pitchRatio: {
      title: string;
      description: string;
    };
    ridgeOffset: {
      title: string;
      description: string;
    };
    wallHeights: {
      title: string;
      left: string;
      right: string;
      description: string;
    };
    wallHeightDifference: {
      title: string;
    };
    leftSlopeAngle: string;
    rightSlopeAngle: string;
    noResults: string;
  };
  canvas: {
    placeholder: string;
    description: string;
    pitch: string;
  };
  units: {
    feet: string;
    meters: string;
    inches: string;
    centimeters: string;
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
