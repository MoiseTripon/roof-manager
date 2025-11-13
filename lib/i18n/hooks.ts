"use client";

import { useContext } from "react";
import { I18nContext } from "./context";

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }

  return context;
}

// Convenience hook for just the translation function
export function useT() {
  const { t } = useTranslation();
  return t;
}
