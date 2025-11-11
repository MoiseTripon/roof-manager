"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SupportedLocale, createI18nInstance } from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
  locale: SupportedLocale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [i18nInstance] = useState(() => createI18nInstance(locale));

  useEffect(() => {
    const match = document.cookie.match(/preferred-locale=([^;]+)/);
    const cookieLocale = match ? match[1] : null;

    if (cookieLocale && cookieLocale !== i18nInstance.language) {
      i18nInstance.changeLanguage(cookieLocale);
    }
  }, [i18nInstance]);

  return (
    <I18nextProvider i18n={i18nInstance} defaultNS="translation">
      {children}
    </I18nextProvider>
  );
}
