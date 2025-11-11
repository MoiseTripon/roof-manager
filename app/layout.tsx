import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { headers } from "next/headers";
import { SupportedLocale } from "@/lib/i18n/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roof Manager",
  description: "Calculate gable roof dimensions for builders",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from middleware
  const headersList = headers();
  const rawLocale = (await headersList).get("x-locale");
  function isSupportedLocale(v: string | null): v is SupportedLocale {
    return v === "en" || v === "es";
  }
  const locale: SupportedLocale = isSupportedLocale(rawLocale)
    ? rawLocale
    : "en";

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
