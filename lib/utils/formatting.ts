import { Locale } from "@/lib/i18n/config";

export function formatDimension(
  value: number,
  locale: Locale,
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
}

export function formatAngle(
  value: number,
  locale: Locale,
  decimals: number = 1
): string {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
