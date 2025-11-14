"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useHouseData } from "@/hooks/useHouseData";
import { ElementPropertyEditor } from "@/components/ElementPropertyEditor";
import { calculateMeasurements } from "@/lib/measurementCalculator";
import {
  calculateElementProperties,
  applyPropertyChanges,
} from "@/lib/elementPropertiesCalculator";
import houseData from "@/lib/data.json";
import { HouseData, ElementProperties } from "@/types/geometry";
import {
  ChevronDown,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Move,
  MousePointer,
  Maximize2,
  Ruler,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";

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

export type DragMode = "vertex" | "element" | "edge";
export type AxisLock = "x" | "y" | "z" | null;

export default function Home() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<"imperial" | "metric">("imperial");
  const { data, setData, updateVertex } = useHouseData(houseData as HouseData);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showVertices, setShowVertices] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [dragMode, setDragMode] = useState<DragMode>("vertex");
  const [isDragging, setIsDragging] = useState(false);
  const [axisLock, setAxisLock] = useState<AxisLock>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard controls for axis locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "x") {
        setAxisLock((prev) => (prev === "x" ? null : "x"));
      } else if (key === "y") {
        setAxisLock((prev) => (prev === "y" ? null : "y"));
      } else if (key === "z") {
        setAxisLock((prev) => (prev === "z" ? null : "z"));
      } else if (key === "escape") {
        setAxisLock(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset axis lock when drag ends
  useEffect(() => {
    if (!isDragging) {
      setAxisLock(null);
    }
  }, [isDragging]);

  // Calculate all element properties
  const elements = useMemo(() => {
    if (!data) return [];

    const wallElements = data.walls.elements.map((wall) =>
      calculateElementProperties(wall, "wall", data.vertices)
    );

    const roofElements = data.roof.elements.map((roof) =>
      calculateElementProperties(roof, "roof", data.vertices)
    );

    return [...wallElements, ...roofElements];
  }, [data]);

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return (
      elements.find((el) => `${el.type}-${el.id}` === selectedElementId) || null
    );
  }, [selectedElementId, elements]);

  // Calculate detailed measurements for selected element
  const selectedElementDetails = useMemo(() => {
    if (!selectedElement || !data) return null;

    const vertices = selectedElement.vertices.map(
      (id) => data.vertices.find((v) => v.id === id)!
    );

    // Calculate side lengths
    const sideLengths = [];
    for (let i = 0; i < vertices.length - 1; i++) {
      const v1 = vertices[i];
      const v2 = vertices[i + 1];
      const length = Math.sqrt(
        Math.pow(v2.x - v1.x, 2) +
          Math.pow(v2.y - v1.y, 2) +
          Math.pow(v2.z - v1.z, 2)
      );
      sideLengths.push({
        from: v1.id,
        to: v2.id,
        length,
      });
    }

    // Calculate angles at each vertex
    const angles = [];
    for (let i = 1; i < vertices.length - 1; i++) {
      const v1 = vertices[i - 1];
      const v2 = vertices[i];
      const v3 = vertices[i + 1];

      // Vectors
      const vec1 = {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z,
      };
      const vec2 = {
        x: v3.x - v2.x,
        y: v3.y - v2.y,
        z: v3.z - v2.z,
      };

      // Dot product and magnitudes
      const dot = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
      const mag1 = Math.sqrt(vec1.x ** 2 + vec1.y ** 2 + vec1.z ** 2);
      const mag2 = Math.sqrt(vec2.x ** 2 + vec2.y ** 2 + vec2.z ** 2);

      // Angle in degrees
      const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
      angles.push({
        vertexId: v2.id,
        angle,
      });
    }

    return {
      sideLengths,
      angles,
    };
  }, [selectedElement, data]);

  // Calculate measurements
  const measurements = useMemo(() => {
    if (!data) return null;
    return calculateMeasurements(data);
  }, [data]);

  const handleUnitsChange = (newUnits: "imperial" | "metric") => {
    if (newUnits === units || !data) return;

    const conversionFactor = newUnits === "metric" ? 0.3048 : 1 / 0.3048;

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

  const handlePropertyChange = (property: string, value: number) => {
    if (!selectedElement || !data) return;

    const updatedVertices = applyPropertyChanges(
      selectedElement,
      property,
      value,
      data.vertices
    );

    setData({
      ...data,
      vertices: updatedVertices,
    });
  };

  const handleElementSelect = (elementType: string, elementId: number) => {
    setSelectedElementId(`${elementType}-${elementId}`);
  };

  const handleVertexDrag = (
    vertexId: number,
    newPosition: { x: number; y: number; z: number }
  ) => {
    updateVertex(vertexId, newPosition);
  };

  const handleMultiVertexDrag = (
    vertexUpdates: Array<{
      id: number;
      position: { x: number; y: number; z: number };
    }>
  ) => {
    if (!data) return;

    const updatedVertices = data.vertices.map((v) => {
      const update = vertexUpdates.find((u) => u.id === v.id);
      if (update) {
        return { ...v, ...update.position };
      }
      return v;
    });

    setData({
      ...data,
      vertices: updatedVertices,
    });
  };

  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("app.title")}
              </h1>
              <p className="text-sm text-gray-600">{t("app.description")}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Units Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleUnitsChange("imperial")}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    units === "imperial"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Imperial
                </button>
                <button
                  onClick={() => handleUnitsChange("metric")}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    units === "metric"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Metric
                </button>
              </div>

              {/* View Options */}
              <div className="flex items-center gap-2 border-l pl-4">
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`p-2 rounded-lg transition-colors ${
                    showLabels
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Toggle labels"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowVertices(!showVertices)}
                  className={`p-2 rounded-lg transition-colors ${
                    showVertices
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Toggle vertices"
                >
                  {showVertices ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className={`p-2 rounded-lg transition-colors ${
                    showMeasurements
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Toggle measurements"
                >
                  <Ruler className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Element Selector and Editor */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Structure
            </h2>

            {/* Drag Mode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drag Mode
              </label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDragMode("vertex")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    dragMode === "vertex"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Drag individual vertices"
                >
                  <MousePointer className="w-3 h-3" />
                  Vertex
                </button>
                <button
                  onClick={() => setDragMode("edge")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    dragMode === "edge"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Drag edges (sides)"
                >
                  <Maximize2 className="w-3 h-3" />
                  Edge
                </button>
                <button
                  onClick={() => setDragMode("element")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    dragMode === "element"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Drag entire elements"
                >
                  <Move className="w-3 h-3" />
                  Element
                </button>
              </div>
            </div>

            {/* Axis Lock Indicator */}
            {axisLock && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700 font-semibold">
                  🔒 Locked to {axisLock.toUpperCase()}-axis
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Press {axisLock.toUpperCase()} again or ESC to unlock
                </p>
              </div>
            )}

            {/* Element Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Element
              </label>
              <div className="relative">
                <select
                  value={selectedElementId || ""}
                  onChange={(e) => setSelectedElementId(e.target.value || null)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Choose an element...</option>
                  <optgroup label="Walls">
                    {elements
                      .filter((el) => el.type === "wall")
                      .map((wall) => (
                        <option
                          key={`wall-${wall.id}`}
                          value={`wall-${wall.id}`}
                        >
                          {wall.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Roof Planes">
                    {elements
                      .filter((el) => el.type === "roof")
                      .map((roof) => (
                        <option
                          key={`roof-${roof.id}`}
                          value={`roof-${roof.id}`}
                        >
                          {roof.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Hint for canvas interaction */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Click on elements in the 3D view to
                select them.
                {dragMode === "vertex" &&
                  showVertices &&
                  " Drag vertices to move them."}
                {dragMode === "edge" && " Drag edges to resize elements."}
                {dragMode === "element" &&
                  " Drag elements to move them entirely."}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                ⌨️ Press{" "}
                <kbd className="px-1 py-0.5 bg-white rounded border">X</kbd>,{" "}
                <kbd className="px-1 py-0.5 bg-white rounded border">Y</kbd>, or{" "}
                <kbd className="px-1 py-0.5 bg-white rounded border">Z</kbd> to
                lock axis
              </p>
              {isDragging && (
                <p className="text-xs text-orange-600 mt-2">
                  🔒 Camera controls locked during drag
                </p>
              )}
            </div>

            {/* Property Editor */}
            <ElementPropertyEditor
              element={selectedElement}
              units={units}
              onPropertyChange={handlePropertyChange}
            />

            {/* Advanced Mode Toggle */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced Vertex Editor</span>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvanced && selectedElement && data && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-3">
                    Direct vertex manipulation
                  </p>
                  <div className="space-y-2">
                    {selectedElement.vertices.map((vId) => {
                      const vertex = data.vertices.find((v) => v.id === vId);
                      if (!vertex) return null;

                      return (
                        <div
                          key={vId}
                          className="grid grid-cols-4 gap-1 text-xs"
                        >
                          <div className="px-1 py-1 bg-white rounded border text-center">
                            V{vId}
                          </div>
                          <input
                            type="number"
                            value={vertex.x.toFixed(2)}
                            onChange={(e) =>
                              updateVertex(vId, {
                                x: parseFloat(e.target.value),
                              })
                            }
                            className="px-1 py-1 border rounded text-center"
                            step="0.1"
                          />
                          <input
                            type="number"
                            value={vertex.y.toFixed(2)}
                            onChange={(e) =>
                              updateVertex(vId, {
                                y: parseFloat(e.target.value),
                              })
                            }
                            className="px-1 py-1 border rounded text-center"
                            step="0.1"
                          />
                          <input
                            type="number"
                            value={vertex.z.toFixed(2)}
                            onChange={(e) =>
                              updateVertex(vId, {
                                z: parseFloat(e.target.value),
                              })
                            }
                            className="px-1 py-1 border rounded text-center"
                            step="0.1"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - 3D Visualization */}
        <div className="flex-1 bg-gray-100 relative">
          {mounted && data ? (
            <HouseCanvas
              data={data}
              scale={0.1}
              showLabels={showLabels}
              showVertices={showVertices}
              showMeasurements={showMeasurements}
              highlightElement={selectedElement}
              onElementSelect={handleElementSelect}
              onVertexDrag={handleVertexDrag}
              onMultiVertexDrag={handleMultiVertexDrag}
              dragMode={dragMode}
              axisLock={axisLock}
              onDragStateChange={handleDragStateChange}
              units={units}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading 3D view...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Measurements & Info */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedElement ? "Element Details" : "Building Information"}
            </h2>

            {selectedElement && selectedElementDetails ? (
              <div className="space-y-4">
                {/* Selected Element Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    {selectedElement.name}
                  </h3>
                  <p className="text-xs text-blue-700 capitalize">
                    Type: {selectedElement.type}
                  </p>
                </div>

                {/* Side Lengths */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-3">
                    Side Lengths
                  </h3>
                  <div className="space-y-2">
                    {selectedElementDetails.sideLengths.map((side, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-green-700">
                          V{side.from} → V{side.to}:
                        </span>
                        <span className="font-medium text-green-900">
                          {formatDimension(side.length)} {unitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Angles */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3">
                    Interior Angles
                  </h3>
                  <div className="space-y-2">
                    {selectedElementDetails.angles.map((angle, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-purple-700">
                          At V{angle.vertexId}:
                        </span>
                        <span className="font-medium text-purple-900">
                          {formatAngle(angle.angle)}°
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Element Properties */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-900 mb-3">
                    Properties
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Height:</span>
                      <span className="font-medium text-orange-900">
                        {formatDimension(selectedElement.height)} {unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Width:</span>
                      <span className="font-medium text-orange-900">
                        {formatDimension(selectedElement.width)} {unitLabel}
                      </span>
                    </div>
                    {selectedElement.angle !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-orange-700">Slope Angle:</span>
                        <span className="font-medium text-orange-900">
                          {formatAngle(selectedElement.angle)}°
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedElementId(null)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Back to Building Info
                </button>
              </div>
            ) : measurements ? (
              <div className="space-y-4">
                {/* Primary Dimensions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">
                    Primary Dimensions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Span:</span>
                      <span className="text-sm font-medium text-blue-900">
                        {formatDimension(measurements.span)} {unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Width:</span>
                      <span className="text-sm font-medium text-blue-900">
                        {formatDimension(measurements.width)} {unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Max Height:</span>
                      <span className="text-sm font-medium text-blue-900">
                        {formatDimension(measurements.maxHeight)} {unitLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Roof Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-900 mb-3">
                    Roof Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">
                        Ridge Height:
                      </span>
                      <span className="text-sm font-medium text-orange-900">
                        {formatDimension(measurements.ridgeHeight)} {unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">
                        Roof Pitch:
                      </span>
                      <span className="text-sm font-medium text-orange-900">
                        {measurements.roofPitch}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">
                        Roof Angle:
                      </span>
                      <span className="text-sm font-medium text-orange-900">
                        {formatAngle(measurements.roofAngle)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Areas */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-3">
                    Surface Areas
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-green-700">
                          Total Wall Area:
                        </span>
                        <span className="text-sm font-bold text-green-900">
                          {formatDimension(measurements.totalWallArea)}{" "}
                          {areaUnitLabel}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {measurements.wallAreas.map((wall) => (
                          <div
                            key={wall.id}
                            className="flex justify-between text-xs cursor-pointer hover:bg-green-100 px-2 py-1 rounded"
                            onClick={() =>
                              setSelectedElementId(`wall-${wall.id}`)
                            }
                          >
                            <span className="text-green-600">
                              • {wall.name}:
                            </span>
                            <span className="text-green-700">
                              {formatDimension(wall.area)} {areaUnitLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-green-700">
                          Total Roof Area:
                        </span>
                        <span className="text-sm font-bold text-green-900">
                          {formatDimension(measurements.totalRoofArea)}{" "}
                          {areaUnitLabel}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {measurements.roofAreas.map((roof) => (
                          <div
                            key={roof.id}
                            className="flex justify-between text-xs cursor-pointer hover:bg-green-100 px-2 py-1 rounded"
                            onClick={() =>
                              setSelectedElementId(`roof-${roof.id}`)
                            }
                          >
                            <span className="text-green-600">
                              • {roof.name}:
                            </span>
                            <span className="text-green-700">
                              {formatDimension(roof.area)} {areaUnitLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Building Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Building Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.walls.elements.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Walls</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.roof.elements.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Roof Planes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.vertices.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Vertices</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDimension(
                          measurements.span * measurements.width
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        Floor {areaUnitLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
