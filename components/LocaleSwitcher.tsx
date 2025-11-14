"use client";

import { i18nConfig, Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/hooks";
import { useRouter } from "next/navigation";

export const LocaleSwitcher: React.FC = () => {
  const { locale } = useTranslation();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale};max-age=${
      365 * 24 * 60 * 60
    };path=/;samesite=lax`;

    // Force a router refresh to update server components
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      {i18nConfig.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === loc
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label={`Switch to ${loc.toUpperCase()}`}
          aria-current={locale === loc ? "true" : "false"}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
