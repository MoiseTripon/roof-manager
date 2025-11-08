import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocale } from "@/hooks/useLocale";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import React from "react";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe("useLocale", () => {
  beforeEach(() => {
    // Initialize i18n for tests
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: {} },
        es: { translation: {} },
      },
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });

    localStorageMock.setItem.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );

  it("initializes with default locale", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.currentLocale).toBe("en");
    expect(result.current.isReady).toBe(false);
  });

  it("becomes ready after mount", async () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });

  it("changes locale and saves to localStorage", async () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.changeLocale("es");
    });

    await waitFor(() => {
      expect(result.current.currentLocale).toBe("es");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "preferred-locale",
        "es"
      );
    });
  });

  it("syncs with i18n language changes", async () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      i18n.changeLanguage("es");
    });

    await waitFor(() => {
      expect(result.current.currentLocale).toBe("es");
    });
  });
});
