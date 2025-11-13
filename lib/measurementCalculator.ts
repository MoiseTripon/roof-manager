import { HouseData, MeasurementResult, Vertex } from "@/types/geometry";
import * as THREE from "three";

export function calculateMeasurements(data: HouseData): MeasurementResult {
  const getVertex = (id: number): Vertex => {
    return (
      data.vertices.find((v) => v.id === id) || { id: 0, x: 0, y: 0, z: 0 }
    );
  };

  // Calculate building dimensions
  const allX = data.vertices.map((v) => v.x);
  const allY = data.vertices.map((v) => v.y);
  const allZ = data.vertices.map((v) => v.z);

  const span = Math.max(...allX) - Math.min(...allX);
  const width = Math.max(...allY) - Math.min(...allY);
  const maxHeight = Math.max(...allZ);

  // Calculate roof pitch (simplified - assuming highest point is ridge)
  const ridgeHeight = maxHeight;
  const wallHeight = Math.min(
    ...data.walls.elements
      .flatMap((wall) => wall.vertices.map((vId) => getVertex(vId).z))
      .filter((z) => z > 0)
  );
  const rise = ridgeHeight - wallHeight;
  const run = span / 2;
  const roofAngle = run > 0 ? (Math.atan(rise / run) * 180) / Math.PI : 0;
  const roofPitch = run > 0 ? `${((rise * 12) / run).toFixed(1)}/12` : "0/12";

  // Calculate wall areas
  const wallAreas = data.walls.elements.map((wall) => {
    const area = calculatePolygonArea(
      wall.vertices.map((vId) => getVertex(vId))
    );
    return { id: wall.id, name: wall.name, area };
  });

  // Calculate roof areas
  const roofAreas = data.roof.elements.map((roof) => {
    const area = calculatePolygonArea(
      roof.vertices.map((vId) => getVertex(vId))
    );
    return { id: roof.id, name: roof.name, area };
  });

  return {
    span,
    width,
    maxHeight,
    roofPitch: parseFloat(roofPitch),
    roofAngle,
    wallAreas,
    roofAreas,
  };
}

function calculatePolygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;

  // Use THREE.js to calculate area
  const vectors = vertices.map((v) => new THREE.Vector3(v.x, v.y, v.z));

  let area = 0;
  for (let i = 2; i < vectors.length; i++) {
    const v1 = vectors[0];
    const v2 = vectors[i - 1];
    const v3 = vectors[i];

    const triangle = new THREE.Triangle(v1, v2, v3);
    area += triangle.getArea();
  }

  return area;
}
