import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/providers/I18nProvider";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
// import { SupportedLocale } from "@/lib/i18n/config";

const inter = Inter({ subsets: ["latin"] });

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Roof Manager",
  description: "Calculate gable roof dimensions for builders",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const locale = params.locale as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      {children}
    </I18nProvider>
  );
}
