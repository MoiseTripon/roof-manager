import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SupportedLocale } from "@/lib/i18n/config";

interface UseLocaleReturn {
  currentLocale: SupportedLocale;
  isReady: boolean;
  changeLocale: (locale: SupportedLocale) => void;
}

export function useLocale(): UseLocaleReturn {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>("en");

  useEffect(() => {
    // Set the current locale after mount to avoid hydration issues
    setCurrentLocale(i18n.language as SupportedLocale);
    setIsReady(true);
  }, [i18n.language]);

  const changeLocale = (locale: SupportedLocale) => {
    i18n.changeLanguage(locale);
    localStorage.setItem("preferred-locale", locale);
    setCurrentLocale(locale);
  };

  return {
    currentLocale,
    isReady,
    changeLocale,
  };
}
