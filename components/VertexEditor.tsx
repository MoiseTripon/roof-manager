import React, { useState } from "react";
import { HouseData, Vertex, PolygonElement } from "@/types/geometry";
import { ChevronDown, ChevronUp, Home, Triangle } from "lucide-react";

interface VertexEditorProps {
  data: HouseData;
  onUpdateVertex: (id: number, updates: Partial<Vertex>) => void;
  units: "imperial" | "metric";
}

export const VertexEditor: React.FC<VertexEditorProps> = ({
  data,
  onUpdateVertex,
  units,
}) => {
  const [expandedElements, setExpandedElements] = useState<Set<string>>(
    new Set()
  );

  const unitLabel = units === "imperial" ? "ft" : "m";

  const toggleElement = (elementKey: string) => {
    setExpandedElements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(elementKey)) {
        newSet.delete(elementKey);
      } else {
        newSet.add(elementKey);
      }
      return newSet;
    });
  };

  const getVertexById = (id: number): Vertex | undefined => {
    return data.vertices.find((v) => v.id === id);
  };

  const renderVertexInputs = (vertexIds: number[]) => {
    // Remove duplicate last vertex if it closes the polygon
    const uniqueIds =
      vertexIds[0] === vertexIds[vertexIds.length - 1]
        ? vertexIds.slice(0, -1)
        : vertexIds;

    return (
      <div className="space-y-2 mt-2">
        {uniqueIds.map((vId) => {
          const vertex = getVertexById(vId);
          if (!vertex) return null;

          return (
            <div
              key={vId}
              className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded"
            >
              <div className="text-xs text-gray-600 flex items-center">
                V{vertex.id}
              </div>
              <input
                type="number"
                value={vertex.x}
                onChange={(e) =>
                  onUpdateVertex(vertex.id, { x: parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.1"
                placeholder={`X (${unitLabel})`}
              />
              <input
                type="number"
                value={vertex.y}
                onChange={(e) =>
                  onUpdateVertex(vertex.id, { y: parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.1"
                placeholder={`Y (${unitLabel})`}
              />
              <input
                type="number"
                value={vertex.z}
                onChange={(e) =>
                  onUpdateVertex(vertex.id, { z: parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.1"
                placeholder={`Z (${unitLabel})`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderElementGroup = (
    elements: PolygonElement[],
    groupName: string,
    icon: React.ReactNode,
    color: string
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-sm font-semibold text-gray-700">{groupName}</h3>
        </div>
        <div className="space-y-2">
          {elements.map((element) => {
            const key = `${groupName}-${element.id}`;
            const isExpanded = expandedElements.has(key);

            return (
              <div
                key={key}
                className={`border rounded-lg ${
                  isExpanded ? "border-blue-300" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleElement(key)}
                  className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                    isExpanded
                      ? "bg-blue-50 text-blue-700"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="text-sm font-medium">{element.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${color} text-white`}
                    >
                      {
                        element.vertices.filter(
                          (v, i, arr) => i === 0 || v !== arr[0]
                        ).length
                      }{" "}
                      vertices
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2 grid grid-cols-4 gap-2">
                      <div>ID</div>
                      <div>X ({unitLabel})</div>
                      <div>Y ({unitLabel})</div>
                      <div>Z ({unitLabel})</div>
                    </div>
                    {renderVertexInputs(element.vertices)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderElementGroup(
        data.walls.elements,
        "Walls",
        <Home className="w-4 h-4 text-gray-600" />,
        "bg-gray-600"
      )}
      {renderElementGroup(
        data.roof.elements,
        "Roof Planes",
        <Triangle className="w-4 h-4 text-orange-600" />,
        "bg-orange-600"
      )}
    </div>
  );
};
