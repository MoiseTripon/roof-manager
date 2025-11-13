import { useState, useEffect } from "react";
import { HouseData } from "@/types/geometry";

export function useHouseData(initialData?: HouseData) {
  const [data, setData] = useState<HouseData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const loadFromJSON = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load data");
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateVertex = (
    id: number,
    updates: Partial<{ x: number; y: number; z: number }>
  ) => {
    if (!data) return;
    setData({
      ...data,
      vertices: data.vertices.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const addVertex = (vertex: { x: number; y: number; z: number }) => {
    if (!data) return;
    const newId = Math.max(...data.vertices.map((v) => v.id)) + 1;
    setData({
      ...data,
      vertices: [...data.vertices, { id: newId, ...vertex }],
    });
    return newId;
  };

  return {
    data,
    loading,
    error,
    setData,
    loadFromJSON,
    updateVertex,
    addVertex,
  };
}
