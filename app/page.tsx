"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useRoofCalculator, Units } from "@/lib/roofCalculator";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { formatDimension, formatAngle } from "@/lib/utils/formatting";
import { useLocale } from "@/hooks/useLocale";

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
  const [wall1Height, setWall1Height] = useState<string>("8");
  const [wall2Height, setWall2Height] = useState<string>("8");
  const [wall1Name, setWall1Name] = useState<string>("Wall 1");
  const [wall2Name, setWall2Name] = useState<string>("Wall 2");

  useEffect(() => {
    setMounted(true);
  }, []);

  const result = useMemo(() => {
    try {
      const spanNum = parseFloat(span);
      const pitchRiseNum = parseFloat(pitchRise);
      const pitchRunNum = parseFloat(pitchRun);
      const ridgeOffsetNum = parseFloat(ridgeOffset) || 0;
      const wall1HeightNum = parseFloat(wall1Height) || 8;
      const wall2HeightNum = parseFloat(wall2Height) || 8;

      if (
        isNaN(spanNum) ||
        isNaN(pitchRiseNum) ||
        isNaN(pitchRunNum) ||
        spanNum <= 0 ||
        pitchRunNum <= 0 ||
        wall1HeightNum < 0 ||
        wall2HeightNum < 0
      ) {
        return null;
      }

      return useRoofCalculator({
        span: spanNum,
        pitchRise: pitchRiseNum,
        pitchRun: pitchRunNum,
        units,
        ridgeOffset: ridgeOffsetNum,
        wall1Height: wall1HeightNum,
        wall2Height: wall2HeightNum,
      });
    } catch (error) {
      return null;
    }
  }, [span, pitchRise, pitchRun, units, ridgeOffset, wall1Height, wall2Height]);

  const unitLabel = t(units === "imperial" ? "units.feet" : "units.meters");
  const pitchUnitLabel = t(
    units === "imperial" ? "units.inches" : "units.centimeters"
  );
  const typicalRun = units === "imperial" ? "12" : "100";

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

    const spanNum = parseFloat(span);
    const pitchRiseNum = parseFloat(pitchRise);
    const pitchRunNum = parseFloat(pitchRun);
    const ridgeOffsetNum = parseFloat(ridgeOffset);
    const wall1HeightNum = parseFloat(wall1Height);
    const wall2HeightNum = parseFloat(wall2Height);

    if (newUnits === "metric" && units === "imperial") {
      setSpan((spanNum * 0.3048).toFixed(2));
      const slopeRatio = pitchRiseNum / pitchRunNum;
      setPitchRun("100");
      setPitchRise((slopeRatio * 100).toFixed(1));
      setRidgeOffset((ridgeOffsetNum * 0.3048).toFixed(2));
      setWall1Height((wall1HeightNum * 0.3048).toFixed(2));
      setWall2Height((wall2HeightNum * 0.3048).toFixed(2));
    } else if (newUnits === "imperial" && units === "metric") {
      setSpan((spanNum / 0.3048).toFixed(2));
      const slopeRatio = pitchRiseNum / pitchRunNum;
      setPitchRun("12");
      setPitchRise((slopeRatio * 12).toFixed(1));
      setRidgeOffset((ridgeOffsetNum / 0.3048).toFixed(2));
      setWall1Height((wall1HeightNum / 0.3048).toFixed(2));
      setWall2Height((wall2HeightNum / 0.3048).toFixed(2));
    }

    setUnits(newUnits);
  };

  const hasDifferentWallHeights =
    parseFloat(wall1Height) !== parseFloat(wall2Height);

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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("sections.inputs")}
            </h2>

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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.span.label", { unit: unitLabel })}
              </label>
              <input
                type="number"
                value={span}
                onChange={(e) => setSpan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
                placeholder={t("inputs.span.placeholder", { unit: unitLabel })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.pitchRise.label", { unit: pitchUnitLabel })}
              </label>
              <input
                type="number"
                value={pitchRise}
                onChange={(e) => setPitchRise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inputs.pitchRun.label", { unit: pitchUnitLabel })}
              </label>
              <input
                type="number"
                value={pitchRun}
                onChange={(e) => setPitchRun(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Wall Heights ({unitLabel})
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={wall1Name}
                      onChange={(e) => setWall1Name(e.target.value)}
                      className="text-xs text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                    />
                  </div>
                  <input
                    type="number"
                    value={wall1Height}
                    onChange={(e) => setWall1Height(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={wall2Name}
                      onChange={(e) => setWall2Name(e.target.value)}
                      className="text-xs text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                    />
                  </div>
                  <input
                    type="number"
                    value={wall2Height}
                    onChange={(e) => setWall2Height(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ridge Position Offset ({unitLabel})
              </label>
              <input
                type="number"
                value={ridgeOffset}
                onChange={(e) => setRidgeOffset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive moves ridge toward {wall2Name}, negative toward{" "}
                {wall1Name}
              </p>
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
                  wall1Height={parseFloat(wall1Height) || 8}
                  wall2Height={parseFloat(wall2Height) || 8}
                  wall1Angle={result.wall1Angle}
                  wall2Angle={result.wall2Angle}
                  units={units}
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">
                    {t("results.noResults")}
                  </p>
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

                {(parseFloat(ridgeOffset) !== 0 || hasDifferentWallHeights) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">
                        {wall1Name} Slope
                      </p>
                      <p className="text-lg font-bold text-yellow-900">
                        {safeFormatAngle(result.wall1Angle)}°
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">
                        {wall2Name} Slope
                      </p>
                      <p className="text-lg font-bold text-yellow-900">
                        {safeFormatAngle(result.wall2Angle)}°
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Ridge Height
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeFormatDimension(result.ridgeHeight)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">
                    {t("results.rafterLength.title")}
                  </p>
                  {parseFloat(ridgeOffset) === 0 && !hasDifferentWallHeights ? (
                    <p className="text-2xl font-bold text-purple-900">
                      {safeFormatDimension(result.commonRafterLength)}{" "}
                      {unitLabel}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-purple-900">
                        {wall1Name}:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.wall1RafterLength)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                      <p className="text-sm text-purple-900">
                        {wall2Name}:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.wall2RafterLength)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    {t("results.pitchAngle.title")}
                  </p>
                  {parseFloat(ridgeOffset) === 0 && !hasDifferentWallHeights ? (
                    <p className="text-2xl font-bold text-orange-900">
                      {safeFormatAngle(result.pitchAngle)}°
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-orange-900">
                        {wall1Name}:{" "}
                        <span className="font-bold">
                          {safeFormatAngle(result.wall1Angle)}°
                        </span>
                      </p>
                      <p className="text-sm text-orange-900">
                        {wall2Name}:{" "}
                        <span className="font-bold">
                          {safeFormatAngle(result.wall2Angle)}°
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    {t("results.pitchRatio.title")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.pitchRatio}
                  </p>
                </div>

                {(parseFloat(ridgeOffset) !== 0 || hasDifferentWallHeights) && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-800 font-medium mb-1">
                      Horizontal Runs
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-indigo-900">
                        {wall1Name} to Ridge:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.wall1Run)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                      <p className="text-sm text-indigo-900">
                        {wall2Name} to Ridge:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(result.wall2Run)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
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
