import { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { I18nProvider } from "@/providers/I18nProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

interface LocaleLayoutProps {
  children: ReactNode;
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  // Get locale same way as root
  const cookieStore = cookies();
  const localeCookie = (await cookieStore).get("NEXT_LOCALE")?.value;
  const acceptLanguage = (await headers()).get("accept-language");

  let locale: Locale = i18nConfig.defaultLocale;

  if (localeCookie && i18nConfig.locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else if (acceptLanguage) {
    for (const l of i18nConfig.locales) {
      if (acceptLanguage.includes(l)) {
        locale = l;
        break;
      }
    }
  }

  const dictionary = await getDictionary(locale);

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <LocaleSwitcher />
      {children}
    </I18nProvider>
  );
}
