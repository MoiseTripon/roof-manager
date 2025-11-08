import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe("LocaleSwitcher", () => {
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

    // Clear localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it("renders placeholder buttons during SSR/initial hydration", () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    // Should render placeholder divs initially
    const placeholders = container.querySelectorAll(".animate-pulse");
    expect(placeholders).toHaveLength(2); // EN and ES
  });

  it("renders interactive buttons after mount", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    // Wait for component to mount
    await waitFor(() => {
      const enButton = screen.getByRole("button", { name: /switch to en/i });
      expect(enButton).toBeInTheDocument();
    });

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    expect(esButton).toBeInTheDocument();
  });

  it("changes language when button is clicked", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      const esButton = screen.getByRole("button", { name: /switch to es/i });
      expect(esButton).toBeInTheDocument();
    });

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    fireEvent.click(esButton);

    await waitFor(() => {
      expect(i18n.language).toBe("es");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "preferred-locale",
        "es"
      );
    });
  });

  it("highlights current language button", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      const enButton = screen.getByRole("button", { name: /switch to en/i });
      expect(enButton).toHaveClass("bg-blue-600", "text-white");
    });

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    expect(esButton).toHaveClass("bg-gray-200", "text-gray-700");
  });

  it("sets aria-current attribute correctly", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      const enButton = screen.getByRole("button", { name: /switch to en/i });
      expect(enButton).toHaveAttribute("aria-current", "true");
    });

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    expect(esButton).toHaveAttribute("aria-current", "false");
  });
});
