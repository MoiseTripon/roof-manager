"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after mount
    setIsHydrated(true);

    // Sync with stored preference after hydration
    const storedLocale = localStorage.getItem("preferred-locale");
    if (storedLocale && i18n.language !== storedLocale) {
      i18n.changeLanguage(storedLocale);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n} defaultNS="translation">
      {children}
    </I18nextProvider>
  );
}
