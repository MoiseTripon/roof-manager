"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { supportedLocales, SupportedLocale } from "@/lib/i18n/config";

export const LocaleSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLocaleChange = (locale: SupportedLocale) => {
    i18n.changeLanguage(locale);
  };

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
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
