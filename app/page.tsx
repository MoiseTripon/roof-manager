"use client";

import { useState, useMemo } from "react";
import {
  useRoofCalculator,
  Units,
  formatDimension,
} from "@/lib/roofCalculator";

export default function Home() {
  const [span, setSpan] = useState<string>("24");
  const [pitchRise, setPitchRise] = useState<string>("6");
  const [pitchRun, setPitchRun] = useState<string>("12");
  const [units, setUnits] = useState<Units>("imperial");

  const result = useMemo(() => {
    try {
      const spanNum = parseFloat(span);
      const pitchRiseNum = parseFloat(pitchRise);
      const pitchRunNum = parseFloat(pitchRun);

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
      });
    } catch (error) {
      return null;
    }
  }, [span, pitchRise, pitchRun, units]);

  const unitLabel = units === "imperial" ? "ft" : "m";
  const pitchUnitLabel = units === "imperial" ? "in" : "cm";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Roof Calculator
        </h1>
        <p className="text-gray-600 mb-8">
          Calculate gable roof dimensions for builders
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Inputs
            </h2>

            {/* Units Switch */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Units
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUnits("imperial")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    units === "imperial"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Imperial
                </button>
                <button
                  onClick={() => setUnits("metric")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    units === "metric"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Metric
                </button>
              </div>
            </div>

            {/* Span Input */}
            <div className="mb-6">
              <label
                htmlFor="span"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Span ({unitLabel})
              </label>
              <input
                id="span"
                type="number"
                value={span}
                onChange={(e) => setSpan(e.target.value)}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter span in ${unitLabel}`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Total width of the building
              </p>
            </div>

            {/* Pitch Rise Input */}
            <div className="mb-6">
              <label
                htmlFor="pitchRise"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pitch Rise ({pitchUnitLabel})
              </label>
              <input
                id="pitchRise"
                type="number"
                value={pitchRise}
                onChange={(e) => setPitchRise(e.target.value)}
                step="0.5"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rise"
              />
              <p className="mt-1 text-xs text-gray-500">
                Vertical rise component of pitch
              </p>
            </div>

            {/* Pitch Run Input */}
            <div className="mb-6">
              <label
                htmlFor="pitchRun"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pitch Run ({pitchUnitLabel})
              </label>
              <input
                id="pitchRun"
                type="number"
                value={pitchRun}
                onChange={(e) => setPitchRun(e.target.value)}
                step="0.5"
                min="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Run"
              />
              <p className="mt-1 text-xs text-gray-500">
                Horizontal run component (typically 12 or 100)
              </p>
            </div>

            {/* Common Pitch Presets */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Common Pitches:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {units === "imperial" ? (
                  <>
                    <button
                      onClick={() => {
                        setPitchRise("4");
                        setPitchRun("12");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      4/12
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("6");
                        setPitchRun("12");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      6/12
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("8");
                        setPitchRun("12");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      8/12
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("12");
                        setPitchRun("12");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      12/12
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setPitchRise("33");
                        setPitchRun("100");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      33/100
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("50");
                        setPitchRun("100");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      50/100
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("67");
                        setPitchRun("100");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      67/100
                    </button>
                    <button
                      onClick={() => {
                        setPitchRise("100");
                        setPitchRun("100");
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      100/100
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Canvas Placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Visualization
            </h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
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
                <p className="mt-2 text-sm text-gray-500">Canvas placeholder</p>
                <p className="text-xs text-gray-400">
                  Roof visualization will go here
                </p>
              </div>
            </div>

            {/* Simple text visualization */}
            {result && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-mono text-center text-gray-700">
                  Pitch: {result.pitchRatio} (
                  {formatDimension(result.pitchAngle)}°)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Outputs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Results
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-1">Run</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatDimension(result.run)} {unitLabel}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Horizontal distance from wall to ridge
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Rise</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatDimension(result.rise)} {unitLabel}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Vertical height from wall to ridge
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">
                    Common Rafter Length
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatDimension(result.commonRafterLength)} {unitLabel}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Length from wall plate to ridge
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    Pitch Angle
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatDimension(result.pitchAngle)}°
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Roof slope angle from horizontal
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    Pitch Ratio
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.pitchRatio}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Rise over run ratio
                  </p>
                </div>
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
                  Enter valid dimensions to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
