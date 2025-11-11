import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "@testing-library/jest-dom";

// Test component that uses translations
const TestComponent = () => {
  const { t } = require("react-i18next").useTranslation();
  return (
    <div>
      <h1>{t("app.title")}</h1>
      <p>{t("app.description")}</p>
      <span>{t("sections.inputs")}</span>
      <span>{t("sections.results")}</span>
    </div>
  );
};

describe("i18n", () => {
  beforeEach(() => {
    i18n.use(initReactI18next).init({
      resources: {
        en: {
          translation: {
            app: {
              title: "Roof Manager",
              description: "Calculate gable roof dimensions for builders",
            },
            sections: {
              inputs: "Inputs",
              results: "Results",
            },
          },
        },
        es: {
          translation: {
            app: {
              title: "Gestor de Techos",
              description:
                "Calcule las dimensiones del techo a dos aguas para constructores",
            },
            sections: {
              inputs: "Entradas",
              results: "Resultados",
            },
          },
        },
      },
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
  });

  it("renders text in English by default", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Roof Manager")).toBeInTheDocument();
      expect(
        screen.getByText("Calculate gable roof dimensions for builders")
      ).toBeInTheDocument();
      expect(screen.getByText("Inputs")).toBeInTheDocument();
      expect(screen.getByText("Results")).toBeInTheDocument();
    });
  });

  it("renders text in Spanish when locale is changed", async () => {
    await act(async () => {
      await i18n.changeLanguage("es");
    });

    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Gestor de Techos")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Calcule las dimensiones del techo a dos aguas para constructores"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Entradas")).toBeInTheDocument();
      expect(screen.getByText("Resultados")).toBeInTheDocument();
    });
  });

  it("switches between locales correctly", async () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    // Initially in English
    await waitFor(() => {
      expect(screen.getByText("Roof Manager")).toBeInTheDocument();
    });

    // Change to Spanish
    await act(async () => {
      await i18n.changeLanguage("es");
    });
    rerender(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Gestor de Techos")).toBeInTheDocument();
    });

    // Change back to English
    await act(async () => {
      await i18n.changeLanguage("en");
    });
    rerender(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Roof Manager")).toBeInTheDocument();
    });
  });
});
