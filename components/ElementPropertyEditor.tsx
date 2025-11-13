import React from "react";
import { ElementProperties } from "@/types/geometry";
import { Move, Maximize2, RotateCw, Ruler } from "lucide-react";

interface ElementPropertyEditorProps {
  element: ElementProperties | null;
  units: "imperial" | "metric";
  onPropertyChange: (property: string, value: number) => void;
}

export const ElementPropertyEditor: React.FC<ElementPropertyEditorProps> = ({
  element,
  units,
  onPropertyChange,
}) => {
  const unitLabel = units === "imperial" ? "ft" : "m";
  const angleLabel = "°";

  if (!element) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dimensions Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Maximize2 className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-700">Dimensions</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Height ({unitLabel})
            </label>
            <input
              type="number"
              value={element.height.toFixed(2)}
              onChange={(e) =>
                onPropertyChange("height", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Width ({unitLabel})
            </label>
            <input
              type="number"
              value={element.width.toFixed(2)}
              onChange={(e) =>
                onPropertyChange("width", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>

          {element.length && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Length ({unitLabel})
              </label>
              <input
                type="number"
                value={element.length.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange("length", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Position Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Move className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-700">Position</h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              X ({unitLabel})
            </label>
            <input
              type="number"
              value={element.position.x.toFixed(2)}
              onChange={(e) =>
                onPropertyChange("positionX", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Y ({unitLabel})
            </label>
            <input
              type="number"
              value={element.position.y.toFixed(2)}
              onChange={(e) =>
                onPropertyChange("positionY", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Z ({unitLabel})
            </label>
            <input
              type="number"
              value={element.position.z.toFixed(2)}
              onChange={(e) =>
                onPropertyChange("positionZ", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Angle Section (for roof elements) */}
      {element.type === "roof" && element.angle !== undefined && (
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <RotateCw className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-orange-700">
              Roof Angle
            </h4>
          </div>

          <div>
            <label className="block text-xs text-orange-600 mb-1">
              Slope Angle ({angleLabel})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={element.angle.toFixed(1)}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-orange-200 rounded-md bg-white"
              />
              <span className="text-xs text-orange-600">Auto-calculated</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-semibold text-blue-700">Element Info</h4>
        </div>
        <div className="text-xs text-blue-600 space-y-1">
          <p>
            Type: <span className="font-medium capitalize">{element.type}</span>
          </p>
          <p>
            Vertices:{" "}
            <span className="font-medium">{element.vertices.length}</span>
          </p>
          <p>
            IDs:{" "}
            <span className="font-mono text-xs">
              [{element.vertices.join(", ")}]
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
