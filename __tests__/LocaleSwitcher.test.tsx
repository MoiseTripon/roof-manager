import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "@testing-library/jest-dom";

describe("LocaleSwitcher", () => {
  let cookieValue: string;

  beforeEach(() => {
    // Reset i18n for each test
    if (i18n.isInitialized) {
      i18n.changeLanguage("en");
    } else {
      i18n.use(initReactI18next).init({
        resources: {
          en: { translation: {} },
          es: { translation: {} },
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
      });
    }

    // Mock document.cookie
    cookieValue = "";
    Object.defineProperty(document, "cookie", {
      get: () => cookieValue,
      set: (value) => {
        cookieValue = value;
      },
      configurable: true,
    });
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

    await act(async () => {
      fireEvent.click(esButton);
    });

    await waitFor(() => {
      expect(i18n.language).toBe("es");
    });

    // Check that cookie was set
    expect(cookieValue).toContain("preferred-locale=es");
  });

  it("sets cookie with correct attributes", async () => {
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

    await act(async () => {
      fireEvent.click(esButton);
    });

    await waitFor(() => {
      expect(cookieValue).toContain("preferred-locale=es");
      expect(cookieValue).toContain("path=/");
      expect(cookieValue).toContain("samesite=lax");
      expect(cookieValue).toContain("max-age=");
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

  it("updates button styles after language change", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      const enButton = screen.getByRole("button", { name: /switch to en/i });
      expect(enButton).toHaveClass("bg-blue-600");
    });

    const esButton = screen.getByRole("button", { name: /switch to es/i });

    await act(async () => {
      fireEvent.click(esButton);
    });

    await waitFor(() => {
      const enButton = screen.getByRole("button", { name: /switch to en/i });
      const esButtonAfter = screen.getByRole("button", {
        name: /switch to es/i,
      });

      expect(enButton).toHaveClass("bg-gray-200", "text-gray-700");
      expect(esButtonAfter).toHaveClass("bg-blue-600", "text-white");
    });
  });

  it("renders correct number of locale buttons", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2); // EN and ES
    });
  });

  it("displays locale in uppercase", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("EN")).toBeInTheDocument();
      expect(screen.getByText("ES")).toBeInTheDocument();
    });
  });
});
