import type { Locale, Dictionary } from "./config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  es: () => import("@/dictionaries/es.json").then((m) => m.default),
  ro: () => import("@/dictionaries/ro.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]();
};
