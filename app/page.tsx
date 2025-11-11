"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useRoofCalculator, Units } from "@/lib/roofCalculator";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { formatDimension, formatAngle } from "@/lib/utils/formatting";
import { useLocale } from "@/hooks/useLocale";

// Dynamic import to avoid SSR issues with Three.js
const RoofCanvas = dynamic(
  () => import("@/components/RoofCanvas").then((mod) => mod.RoofCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

export default function Home() {
  const { t } = useTranslation();
  const { currentLocale, isReady } = useLocale();
  const [mounted, setMounted] = useState(false);

  const [span, setSpan] = useState<string>("24");
  const [pitchRise, setPitchRise] = useState<string>("6");
  const [pitchRun, setPitchRun] = useState<string>("12");
  const [units, setUnits] = useState<Units>("imperial");
  const [ridgeOffset, setRidgeOffset] = useState<string>("0");

  // Ensure client-side only rendering for certain features
  useEffect(() => {
    setMounted(true);
  }, []);

  const result = useMemo(() => {
    try {
      const spanNum = parseFloat(span);
      const pitchRiseNum = parseFloat(pitchRise);
      const pitchRunNum = parseFloat(pitchRun);
      const ridgeOffsetNum = parseFloat(ridgeOffset) || 0;

      if (
        isNaN(spanNum) ||
        isNaN(pitchRiseNum) ||
        isNaN(pitchRunNum) ||
        spanNum <= 0 ||
        pitchRunNum <= 0
      ) {
        return null;
      }

      return useRoofCalculator({
        span: spanNum,
        pitchRise: pitchRiseNum,
        pitchRun: pitchRunNum,
        units,
        ridgeOffset: ridgeOffsetNum,
      });
    } catch (error) {
      return null;
    }
  }, [span, pitchRise, pitchRun, units, ridgeOffset]);

  const unitLabel = t(units === "imperial" ? "units.feet" : "units.meters");
  const pitchUnitLabel = t(
    units === "imperial" ? "units.inches" : "units.centimeters"
  );
  const typicalRun = units === "imperial" ? "12" : "100";

  // Safe formatting that waits for locale to be ready
  const safeFormatDimension = (value: number, decimals?: number) => {
    if (!isReady) return value.toFixed(decimals ?? 2);
    return formatDimension(value, currentLocale, decimals);
  };

  const safeFormatAngle = (value: number, decimals?: number) => {
    if (!isReady) return value.toFixed(decimals ?? 1);
    return formatAngle(value, currentLocale, decimals);
  };

  const handleUnitsChange = (newUnits: Units) => {
    if (newUnits === units) return;

    // Convert values when switching units
    const spanNum = parseFloat(span);
    const pitchRiseNum = parseFloat(pitchRise);
    const pitchRunNum = parseFloat(pitchRun);
    const ridgeOffsetNum = parseFloat(ridgeOffset);

    if (newUnits === "metric" && units === "imperial") {
      // Convert from imperial to metric
      setSpan((spanNum * 0.3048).toFixed(2)); // feet to meters
      setPitchRise((pitchRiseNum * 2.54).toFixed(1)); // inches to cm
      setPitchRun("100"); // Standard metric run
      setRidgeOffset((ridgeOffsetNum * 0.3048).toFixed(2)); // feet to meters
    } else if (newUnits === "imperial" && units === "metric") {
      // Convert from metric to imperial
      setSpan((spanNum / 0.3048).toFixed(2)); // meters to feet
      setPitchRise((pitchRiseNum / 2.54).toFixed(1)); // cm to inches
      setPitchRun("12"); // Standard imperial run
      setRidgeOffset((ridgeOffsetNum / 0.3048).toFixed(2)); // meters to feet
    }

    setUnits(newUnits);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t("app.title")}
            </h1>
            <p className="text-gray-600">{t("app.description")}</p>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("sections.inputs")}
            </h2>

            {/* Units Switch */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("inputs.units.label")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUnitsChange("imperial")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    units === "imperial"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={!mounted}
                >
                  {t("inputs.units.imperial")}
                </button>
                <button
                  onClick={() => handleUnitsChange("metric")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    units === "metric"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={!mounted}
                >
                  {t("inputs.units.metric")}
                </button>
              </div>
            </div>

            {/* Span Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.span.label")} ({unitLabel})
              </label>
              <input
                type="number"
                value={span}
                onChange={(e) => setSpan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("inputs.span.description")}
              </p>
            </div>

            {/* Pitch Rise Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.pitchRise.label")} ({pitchUnitLabel})
              </label>
              <input
                type="number"
                value={pitchRise}
                onChange={(e) => setPitchRise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("inputs.pitchRise.description")}
              </p>
            </div>

            {/* Pitch Run Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.pitchRun.label")} ({pitchUnitLabel})
              </label>
              <input
                type="number"
                value={pitchRun}
                onChange={(e) => setPitchRun(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("inputs.pitchRun.description", { typical: typicalRun })}
              </p>
            </div>

            {/* Ridge Offset Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.ridgeOffset.label", {
                  defaultValue: "Ridge Offset",
                })}{" "}
                ({unitLabel})
              </label>
              <input
                type="number"
                value={ridgeOffset}
                onChange={(e) => setRidgeOffset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("inputs.ridgeOffset.description", {
                  defaultValue:
                    "Positive moves ridge right, negative moves left",
                })}
              </p>
              {/* Slider for easier adjustment */}
              <input
                type="range"
                value={ridgeOffset}
                onChange={(e) => setRidgeOffset(e.target.value)}
                min={-parseFloat(span) / 2 || -12}
                max={parseFloat(span) / 2 || 12}
                step="0.1"
                className="w-full mt-2"
              />
            </div>
          </div>

          {/* Center Column - Canvas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("sections.visualization")}
            </h2>
            <div className="bg-gray-100 rounded-lg h-96 overflow-hidden">
              {mounted && result ? (
                <RoofCanvas
                  run={result.run}
                  rise={result.rise}
                  span={parseFloat(span)}
                  ridgeOffset={parseFloat(ridgeOffset) || 0}
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      {t("results.noResults")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result && mounted && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-mono text-center text-gray-700">
                    {t("canvas.pitch", {
                      ratio: result.pitchRatio,
                      angle: safeFormatAngle(result.pitchAngle),
                    })}
                  </p>
                </div>

                {/* Display asymmetric angles when ridge is offset */}
                {parseFloat(ridgeOffset) !== 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">
                        {t("results.leftAngle.title", {
                          defaultValue: "Left Slope Angle",
                        })}
                      </p>
                      <p className="text-lg font-bold text-yellow-900">
                        {safeFormatAngle(result.leftAngle)}°
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">
                        {t("results.rightAngle.title", {
                          defaultValue: "Right Slope Angle",
                        })}
                      </p>
                      <p className="text-lg font-bold text-yellow-900">
                        {safeFormatAngle(result.rightAngle)}°
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Outputs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("sections.results")}
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    {t("results.run.title")}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeFormatDimension(result.run)} {unitLabel}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t("results.run.description")}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    {t("results.rise.title")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeFormatDimension(result.rise)} {unitLabel}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {t("results.rise.description")}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">
                    {t("results.rafterLength.title")}
                  </p>
                  {parseFloat(ridgeOffset) === 0 ? (
                    <p className="text-2xl font-bold text-purple-900">
                      {safeFormatDimension(result.commonRafterLength)}{" "}
                      {unitLabel}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-purple-900">
                        Left:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.leftRafterLength)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                      <p className="text-sm text-purple-900">
                        Right:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.rightRafterLength)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-purple-700 mt-1">
                    {t("results.rafterLength.description")}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    {t("results.pitchAngle.title")}
                  </p>
                  {parseFloat(ridgeOffset) === 0 ? (
                    <p className="text-2xl font-bold text-orange-900">
                      {safeFormatAngle(result.pitchAngle)}°
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-orange-900">
                        Left:{" "}
                        <span className="font-bold">
                          {safeFormatAngle(result.leftAngle)}°
                        </span>
                      </p>
                      <p className="text-sm text-orange-900">
                        Right:{" "}
                        <span className="font-bold">
                          {safeFormatAngle(result.rightAngle)}°
                        </span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-orange-700 mt-1">
                    {t("results.pitchAngle.description")}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    {t("results.pitchRatio.title")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.pitchRatio}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {t("results.pitchRatio.description")}
                  </p>
                </div>

                {parseFloat(ridgeOffset) !== 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-1">
                      {t("results.ridgeOffset.title", {
                        defaultValue: "Ridge Offset",
                      })}
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {safeFormatDimension(parseFloat(ridgeOffset))} {unitLabel}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {t("results.ridgeOffset.description", {
                        defaultValue: "Distance from center",
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  {t("results.noResults")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
