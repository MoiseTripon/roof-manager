import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "@testing-library/jest-dom";

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    // Initialize i18n for tests
    if (!i18n.isInitialized) {
      i18n.use(initReactI18next).init({
        resources: {
          en: { translation: {} },
          es: { translation: {} },
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
      });
    } else {
      // Reset language to 'en' if already initialized
      i18n.changeLanguage("en");
    }

    // Clear cookies
    document.cookie = "";
  });

  // REMOVED: SSR placeholder test - component no longer has SSR placeholders
  // The component renders buttons directly without a loading state

  it("renders interactive buttons immediately", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    const enButton = screen.getByRole("button", { name: /switch to en/i });
    const esButton = screen.getByRole("button", { name: /switch to es/i });

    expect(enButton).toBeInTheDocument();
    expect(esButton).toBeInTheDocument();
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
      // Check cookie was set (component now uses cookies instead of localStorage)
      expect(document.cookie).toContain("preferred-locale=es");
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

  // NEW TEST: Verify cookie attributes
  it("sets cookie with correct attributes", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    fireEvent.click(esButton);

    await waitFor(() => {
      const cookie = document.cookie;
      expect(cookie).toContain("preferred-locale=es");
      expect(cookie).toContain("path=/");
      expect(cookie).toContain("samesite=lax");
    });
  });

  // NEW TEST: Verify button state updates after language change
  it("updates button styling after language change", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    const esButton = screen.getByRole("button", { name: /switch to es/i });
    const enButton = screen.getByRole("button", { name: /switch to en/i });

    // Initially EN should be highlighted
    expect(enButton).toHaveClass("bg-blue-600", "text-white");
    expect(esButton).toHaveClass("bg-gray-200", "text-gray-700");

    // Click ES button
    fireEvent.click(esButton);

    // After click, ES should be highlighted
    await waitFor(() => {
      expect(esButton).toHaveClass("bg-blue-600", "text-white");
      expect(enButton).toHaveClass("bg-gray-200", "text-gray-700");
    });
  });

  // NEW TEST: Verify all supported locales are rendered
  it("renders all supported locales", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2); // EN and ES
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("ES")).toBeInTheDocument();
  });

  // NEW TEST: Verify accessibility
  it("has proper accessibility attributes", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label");
      expect(button).toHaveAttribute("aria-current");
    });
  });
});
