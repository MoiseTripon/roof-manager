import { ReactNode } from "react";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { i18nConfig } from "@/lib/i18n/config";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Detect locale from cookie or header
  const cookieStore = cookies();
  const localeCookie = (await cookieStore).get("NEXT_LOCALE")?.value;
  const acceptLanguage = (await headers()).get("accept-language");

  const locale =
    localeCookie || detectLocale(acceptLanguage) || i18nConfig.defaultLocale;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}

function detectLocale(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null;

  for (const locale of i18nConfig.locales) {
    if (acceptLanguage.includes(locale)) {
      return locale;
    }
  }
  return null;
}
