"use client";

import { createContext } from "react";
import type { Locale, Dictionary } from "./config";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
