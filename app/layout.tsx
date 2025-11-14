import { ReactNode } from "react";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { I18nProvider } from "@/providers/I18nProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  // Determine locale
  let locale: Locale = i18nConfig.defaultLocale;

  if (localeCookie && i18nConfig.locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else if (acceptLanguage) {
    locale = detectLocale(acceptLanguage) || i18nConfig.defaultLocale;
  }

  // Get dictionary on server
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

function detectLocale(acceptLanguage: string): Locale | null {
  if (!acceptLanguage) return null;

  for (const locale of i18nConfig.locales) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      return locale;
    }
  }
  return null;
}
