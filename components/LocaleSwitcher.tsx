"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { supportedLocales, SupportedLocale } from "@/lib/i18n/config";

export const LocaleSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLocaleChange = (locale: SupportedLocale) => {
    // Set cookie for persistence
    document.cookie = `preferred-locale=${locale};max-age=${
      365 * 24 * 60 * 60
    };path=/;samesite=lax`;

    // Change language
    i18n.changeLanguage(locale);

    // Optional: Force router refresh to ensure all server components get updated
    // This will cause a full page reload but ensures consistency
    // window.location.reload();
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
          aria-current={i18n.language === locale ? "true" : "false"}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
