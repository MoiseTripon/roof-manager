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

  // Find ridge height (highest point in roof)
  const roofVertices = data.roof.elements.flatMap((roof) =>
    roof.vertices.map((vId) => getVertex(vId))
  );
  const ridgeHeight = Math.max(...roofVertices.map((v) => v.z));

  // Calculate roof pitch
  const wallHeights = data.walls.elements
    .flatMap((wall) => wall.vertices.map((vId) => getVertex(vId).z))
    .filter((z) => z > 0);
  const avgWallHeight =
    wallHeights.length > 0
      ? wallHeights.reduce((a, b) => a + b, 0) / wallHeights.length
      : 0;

  const rise = ridgeHeight - avgWallHeight;
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

  const totalWallArea = wallAreas.reduce((sum, w) => sum + w.area, 0);
  const totalRoofArea = roofAreas.reduce((sum, r) => sum + r.area, 0);

  return {
    span,
    width,
    maxHeight,
    ridgeHeight,
    roofPitch,
    roofAngle,
    wallAreas,
    roofAreas,
    totalWallArea,
    totalRoofArea,
  };
}

function calculatePolygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;

  // Remove duplicate closing vertex if exists
  const uniqueVertices =
    vertices[0] === vertices[vertices.length - 1]
      ? vertices.slice(0, -1)
      : vertices;

  // Use THREE.js to calculate area
  const vectors = uniqueVertices.map((v) => new THREE.Vector3(v.x, v.y, v.z));

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
