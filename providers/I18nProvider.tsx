"use client";

import { ReactNode, useMemo } from "react";
import { I18nContext } from "@/lib/i18n/context";
import type { Locale, Dictionary } from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

export function I18nProvider({
  children,
  locale,
  dictionary,
}: I18nProviderProps) {
  const value = useMemo(() => {
    // Helper function to get nested translation by dot notation
    const t = (key: string): string => {
      const keys = key.split(".");
      let result: unknown = dictionary;

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      return typeof result === "string" ? result : key;
    };

    return { locale, dictionary, t };
  }, [locale, dictionary]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
