"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supportedLocales, SupportedLocale } from "@/lib/i18n/config";

export const LocaleSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering interactive elements after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (locale: SupportedLocale) => {
    i18n.changeLanguage(locale);
    // Optionally store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", locale);
    }
  };

  // Return a placeholder during SSR and initial hydration
  if (!mounted) {
    return (
      <div className="flex gap-2">
        {supportedLocales.map((locale) => (
          <div
            key={locale}
            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 animate-pulse"
            aria-hidden="true"
          >
            {locale.toUpperCase()}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            i18n.language === locale
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label={`Switch to ${locale.toUpperCase()}`}
          aria-current={i18n.language === locale ? "true" : "false"}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
