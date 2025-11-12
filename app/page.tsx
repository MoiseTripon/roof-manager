"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useRoofCalculator, Units } from "@/lib/roofCalculator";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { formatDimension, formatAngle } from "@/lib/utils/formatting";
import { useLocale } from "@/hooks/useLocale";
import { Wall } from "@/types/roof";
import { WallEditor } from "@/components/WallEditor";

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

const createInitialWalls = (units: Units): Wall[] => {
  const defaultHeight = units === "imperial" ? 8 : 2.4;
  const defaultSpan = units === "imperial" ? 24 : 7.3;
  const defaultWidth = units === "imperial" ? 30 : 9.1;

  return [
    {
      id: "front",
      name: "Front Wall",
      height: defaultHeight,
      length: defaultWidth,
      position: "front",
    },
    {
      id: "back",
      name: "Back Wall",
      height: defaultHeight,
      length: defaultWidth,
      position: "back",
    },
    {
      id: "left",
      name: "Left Wall",
      height: defaultHeight,
      length: defaultSpan,
      position: "left",
    },
    {
      id: "right",
      name: "Right Wall",
      height: defaultHeight,
      length: defaultSpan,
      position: "right",
    },
  ];
};

export default function Home() {
  const { t } = useTranslation();
  const { currentLocale, isReady } = useLocale();
  const [mounted, setMounted] = useState(false);

  const [units, setUnits] = useState<Units>("imperial");
  const [walls, setWalls] = useState<Wall[]>(() =>
    createInitialWalls("imperial")
  );
  const [pitchRise, setPitchRise] = useState<string>("6");
  const [pitchRun, setPitchRun] = useState<string>("12");
  const [ridgeOffset, setRidgeOffset] = useState<string>("0");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get span from front/back walls (they should have same length)
  const span = useMemo(() => {
    const leftWall = walls.find((w) => w.position === "left");
    return leftWall?.length || 24;
  }, [walls]);

  // Get width from left/right walls
  const width = useMemo(() => {
    const frontWall = walls.find((w) => w.position === "front");
    return frontWall?.length || 30;
  }, [walls]);

  const result = useMemo(() => {
    try {
      const pitchRiseNum = parseFloat(pitchRise);
      const pitchRunNum = parseFloat(pitchRun);
      const ridgeOffsetNum = parseFloat(ridgeOffset) || 0;

      if (
        isNaN(pitchRiseNum) ||
        isNaN(pitchRunNum) ||
        pitchRunNum <= 0 ||
        walls.some((w) => w.height < 0 || w.length <= 0)
      ) {
        return null;
      }

      return useRoofCalculator({
        walls,
        pitchRise: pitchRiseNum,
        pitchRun: pitchRunNum,
        units,
        ridgeOffset: ridgeOffsetNum,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      return null;
    }
  }, [walls, pitchRise, pitchRun, units, ridgeOffset]);

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

    const conversionFactor = newUnits === "metric" ? 0.3048 : 1 / 0.3048;
    const pitchRiseNum = parseFloat(pitchRise);
    const pitchRunNum = parseFloat(pitchRun);
    const ridgeOffsetNum = parseFloat(ridgeOffset);

    // Convert walls
    setWalls(
      walls.map((wall) => ({
        ...wall,
        height: wall.height * conversionFactor,
        length: wall.length * conversionFactor,
      }))
    );

    // Convert pitch
    if (newUnits === "metric") {
      const slopeRatio = pitchRiseNum / pitchRunNum;
      setPitchRun("100");
      setPitchRise((slopeRatio * 100).toFixed(1));
    } else {
      const slopeRatio = pitchRiseNum / pitchRunNum;
      setPitchRun("12");
      setPitchRise((slopeRatio * 12).toFixed(1));
    }

    setRidgeOffset((ridgeOffsetNum * conversionFactor).toFixed(2));
    setUnits(newUnits);
  };

  const handleUpdateWall = (wallId: string, updates: Partial<Wall>) => {
    setWalls(
      walls.map((wall) => (wall.id === wallId ? { ...wall, ...updates } : wall))
    );
  };

  const hasDifferentWallHeights = useMemo(() => {
    const frontWall = walls.find((w) => w.position === "front");
    const backWall = walls.find((w) => w.position === "back");
    return frontWall && backWall && frontWall.height !== backWall.height;
  }, [walls]);

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
                Walls Configuration
              </label>
              <WallEditor
                walls={walls}
                onUpdateWall={handleUpdateWall}
                unitLabel={unitLabel}
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
                Positive = towards back wall, Negative = towards front wall
              </p>
              <input
                type="range"
                value={ridgeOffset}
                onChange={(e) => setRidgeOffset(e.target.value)}
                min={-span / 2}
                max={span / 2}
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
                  walls={result.walls}
                  roofSides={result.roofSides}
                  ridge={result.ridge}
                  span={span}
                  width={width}
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
                    Base Pitch: {result.pitchRatio} (
                    {safeFormatAngle(result.pitchAngle)}°)
                  </p>
                </div>

                {result.roofSides.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {result.roofSides.map((side) => (
                      <div
                        key={side.id}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <p className="text-xs text-yellow-800 font-medium mb-1">
                          {side.name}
                        </p>
                        <p className="text-lg font-bold text-yellow-900">
                          {safeFormatAngle(side.angle)}°
                        </p>
                      </div>
                    ))}
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
                    Base Run (Half Span)
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeFormatDimension(result.baseRun)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Ridge Height
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeFormatDimension(result.ridge.height)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">
                    Rafter Lengths
                  </p>
                  {parseFloat(ridgeOffset) === 0 && !hasDifferentWallHeights ? (
                    <p className="text-2xl font-bold text-purple-900">
                      {safeFormatDimension(result.commonRafterLength)}{" "}
                      {unitLabel}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {result.roofSides.map((side) => (
                        <p key={side.id} className="text-sm text-purple-900">
                          {side.name}:{" "}
                          <span className="font-bold">
                            {safeFormatDimension(side.rafterLength)}
                          </span>{" "}
                          {unitLabel}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    Slope Angles
                  </p>
                  {parseFloat(ridgeOffset) === 0 && !hasDifferentWallHeights ? (
                    <p className="text-2xl font-bold text-orange-900">
                      {safeFormatAngle(result.pitchAngle)}°
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {result.roofSides.map((side) => (
                        <p key={side.id} className="text-sm text-orange-900">
                          {side.name}:{" "}
                          <span className="font-bold">
                            {safeFormatAngle(side.angle)}°
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800 font-medium mb-1">
                    Horizontal Runs
                  </p>
                  <div className="space-y-1">
                    {result.roofSides.map((side) => (
                      <p key={side.id} className="text-sm text-indigo-900">
                        {side.name}:{" "}
                        <span className="font-bold">
                          {safeFormatDimension(side.horizontalRun)}
                        </span>{" "}
                        {unitLabel}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    Building Dimensions
                  </p>
                  <div className="space-y-1 text-sm text-gray-900">
                    <p>
                      Span:{" "}
                      <span className="font-bold">
                        {safeFormatDimension(span)}
                      </span>{" "}
                      {unitLabel}
                    </p>
                    <p>
                      Width:{" "}
                      <span className="font-bold">
                        {safeFormatDimension(width)}
                      </span>{" "}
                      {unitLabel}
                    </p>
                  </div>
                </div>
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
