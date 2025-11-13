"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useHouseData } from "@/hooks/useHouseData";
import { VertexEditor } from "@/components/VertexEditor";
import { calculateMeasurements } from "@/lib/measurementCalculator";
import houseData from "@/lib/data.json";
import { HouseData } from "@/types/geometry";

const HouseCanvas = dynamic(
  () => import("@/components/HouseCanvas").then((mod) => mod.HouseCanvas),
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
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<"imperial" | "metric">("imperial");
  const { data, setData, updateVertex } = useHouseData(houseData as HouseData);
  const [showLabels, setShowLabels] = useState(true);
  const [showVertices, setShowVertices] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const measurements = useMemo(() => {
    if (!data) return null;
    return calculateMeasurements(data);
  }, [data]);

  const handleUnitsChange = (newUnits: "imperial" | "metric") => {
    if (newUnits === units || !data) return;

    const conversionFactor = newUnits === "metric" ? 0.3048 : 1 / 0.3048;

    // Convert all vertices
    const convertedVertices = data.vertices.map((v) => ({
      ...v,
      x: v.x * conversionFactor,
      y: v.y * conversionFactor,
      z: v.z * conversionFactor,
    }));

    setData({
      ...data,
      vertices: convertedVertices,
    });

    setUnits(newUnits);
  };

  const unitLabel = units === "imperial" ? "ft" : "m";
  const areaUnitLabel = units === "imperial" ? "ft²" : "m²";

  const formatDimension = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const formatAngle = (value: number, decimals = 1) => {
    return value.toFixed(decimals);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              House Builder 3D
            </h1>
            <p className="text-gray-600">
              Interactive 3D house visualization and editor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Structure Configuration
            </h2>

            {/* Units Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Units
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
                  Imperial
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
                  Metric
                </button>
              </div>
            </div>

            {/* Vertex Editor */}
            {data && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edit Structure
                  </label>
                  <VertexEditor
                    data={data}
                    onUpdateVertex={updateVertex}
                    units={units}
                  />
                </div>

                {/* Display Options */}
                <div className="border-t pt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Display Options
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showLabels"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor="showLabels"
                      className="text-sm text-gray-700"
                    >
                      Show Labels
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showVertices"
                      checked={showVertices}
                      onChange={(e) => setShowVertices(e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor="showVertices"
                      className="text-sm text-gray-700"
                    >
                      Show Vertex IDs
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Visualization Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              3D Visualization
            </h2>
            <div className="bg-gray-100 rounded-lg h-96 overflow-hidden">
              {mounted && data ? (
                <HouseCanvas
                  data={data}
                  scale={0.1}
                  showLabels={showLabels}
                  showVertices={showVertices}
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">Loading 3D view...</p>
                </div>
              )}
            </div>

            {/* Quick Info */}
            {measurements && mounted && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-mono text-center text-gray-700">
                    Roof Pitch: {measurements.roofPitch}/12 (
                    {formatAngle(measurements.roofAngle)}°)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-1">
                      Max Height
                    </p>
                    <p className="text-lg font-bold text-yellow-900">
                      {formatDimension(measurements.maxHeight)} {unitLabel}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800 font-medium mb-1">
                      Building Area
                    </p>
                    <p className="text-lg font-bold text-green-900">
                      {formatDimension(measurements.span * measurements.width)}{" "}
                      {areaUnitLabel}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Measurements & Results
            </h2>

            {measurements ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    Building Span
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatDimension(measurements.span)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Building Width
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatDimension(measurements.width)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">
                    Maximum Height
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatDimension(measurements.maxHeight)} {unitLabel}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    Roof Angle
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatAngle(measurements.roofAngle)}°
                  </p>
                </div>

                {/* Wall Areas */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-2">
                    Wall Areas
                  </p>
                  <div className="space-y-1">
                    {measurements.wallAreas.map((wall) => (
                      <div
                        key={wall.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{wall.name}:</span>
                        <span className="font-medium text-gray-900">
                          {formatDimension(wall.area)} {areaUnitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roof Areas */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800 font-medium mb-2">
                    Roof Areas
                  </p>
                  <div className="space-y-1">
                    {measurements.roofAreas.map((roof) => (
                      <div
                        key={roof.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-indigo-600">{roof.name}:</span>
                        <span className="font-medium text-indigo-900">
                          {formatDimension(roof.area)} {areaUnitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Summary
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900">
                      Total Wall Area:{" "}
                      <span className="font-bold">
                        {formatDimension(
                          measurements.wallAreas.reduce(
                            (sum, w) => sum + w.area,
                            0
                          )
                        )}{" "}
                        {areaUnitLabel}
                      </span>
                    </p>
                    <p className="text-gray-900">
                      Total Roof Area:{" "}
                      <span className="font-bold">
                        {formatDimension(
                          measurements.roofAreas.reduce(
                            (sum, r) => sum + r.area,
                            0
                          )
                        )}{" "}
                        {areaUnitLabel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  No measurements available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
