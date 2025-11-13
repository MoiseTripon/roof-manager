"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useHouseData } from "@/hooks/useHouseData";
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
  const { data, setData, updateVertex } = useHouseData(houseData as HouseData);
  const [scale, setScale] = useState(0.1);
  const [showLabels, setShowLabels] = useState(true);
  const [showVertices, setShowVertices] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            House Builder
          </h1>
          <p className="text-gray-600">3D House Visualization from JSON Data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Controls
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale: {scale}
                </label>
                <input
                  type="range"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showLabels"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showLabels" className="text-sm text-gray-700">
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
                <label htmlFor="showVertices" className="text-sm text-gray-700">
                  Show Vertex IDs
                </label>
              </div>
            </div>

            {/* Vertex Editor */}
            {data && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Vertices
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {data.vertices.map((vertex) => (
                    <div
                      key={vertex.id}
                      className="p-2 bg-gray-50 rounded text-xs"
                    >
                      <div className="font-medium mb-1">ID: {vertex.id}</div>
                      <div className="grid grid-cols-3 gap-1">
                        <input
                          type="number"
                          value={vertex.x}
                          onChange={(e) =>
                            updateVertex(vertex.id, {
                              x: parseFloat(e.target.value),
                            })
                          }
                          className="px-1 py-0.5 border rounded"
                          step="0.5"
                        />
                        <input
                          type="number"
                          value={vertex.y}
                          onChange={(e) =>
                            updateVertex(vertex.id, {
                              y: parseFloat(e.target.value),
                            })
                          }
                          className="px-1 py-0.5 border rounded"
                          step="0.5"
                        />
                        <input
                          type="number"
                          value={vertex.z}
                          onChange={(e) =>
                            updateVertex(vertex.id, {
                              z: parseFloat(e.target.value),
                            })
                          }
                          className="px-1 py-0.5 border rounded"
                          step="0.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3D Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              3D View
            </h2>
            <div className="bg-gray-100 rounded-lg h-[500px] overflow-hidden">
              {mounted && data ? (
                <HouseCanvas
                  data={data}
                  scale={scale}
                  showLabels={showLabels}
                  showVertices={showVertices}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Info Panel */}
        {data && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Structure Info
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Vertices</p>
                <p className="text-2xl font-bold text-blue-900">
                  {data.vertices.length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800 font-medium">Walls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.walls.elements.length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  Roof Planes
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {data.roof.elements.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
