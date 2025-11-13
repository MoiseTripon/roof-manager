import { HouseData, ElementProperties, Vertex } from "@/types/geometry";
import * as THREE from "three";

export function calculateElementProperties(
  element: { id: number; name: string; vertices: number[] },
  type: "wall" | "roof",
  allVertices: Vertex[]
): ElementProperties {
  const getVertex = (id: number): Vertex => {
    return allVertices.find((v) => v.id === id) || { id: 0, x: 0, y: 0, z: 0 };
  };

  // Remove duplicate closing vertex
  const uniqueVertexIds =
    element.vertices[0] === element.vertices[element.vertices.length - 1]
      ? element.vertices.slice(0, -1)
      : element.vertices;

  const vertices = uniqueVertexIds.map((id) => getVertex(id));

  // Calculate dimensions based on element type
  if (type === "wall" && vertices.length === 4) {
    // For rectangular walls
    const bottomLeft = vertices[0];
    const bottomRight = vertices[1];
    const topRight = vertices[2];
    const topLeft = vertices[3];

    const width = Math.sqrt(
      Math.pow(bottomRight.x - bottomLeft.x, 2) +
        Math.pow(bottomRight.y - bottomLeft.y, 2)
    );
    const height = Math.abs(topLeft.z - bottomLeft.z);

    const centerX = (bottomLeft.x + bottomRight.x + topLeft.x + topRight.x) / 4;
    const centerY = (bottomLeft.y + bottomRight.y + topLeft.y + topRight.y) / 4;
    const centerZ = (bottomLeft.z + topLeft.z) / 2;

    return {
      id: element.id,
      name: element.name,
      type,
      height,
      width,
      position: { x: centerX, y: centerY, z: centerZ },
      vertices: uniqueVertexIds,
    };
  } else if (type === "roof") {
    // For triangular roof planes
    const allX = vertices.map((v) => v.x);
    const allY = vertices.map((v) => v.y);
    const allZ = vertices.map((v) => v.z);

    const width =
      Math.max(...allX) - Math.min(...allX) ||
      Math.max(...allY) - Math.min(...allY);
    const height = Math.max(...allZ) - Math.min(...allZ);

    // Calculate angle of the roof plane
    if (vertices.length >= 3) {
      const v1 = new THREE.Vector3(
        vertices[1].x - vertices[0].x,
        vertices[1].y - vertices[0].y,
        vertices[1].z - vertices[0].z
      );
      const v2 = new THREE.Vector3(
        vertices[2].x - vertices[0].x,
        vertices[2].y - vertices[0].y,
        vertices[2].z - vertices[0].z
      );
      const normal = v1.cross(v2).normalize();
      const angle = Math.acos(Math.abs(normal.y)) * (180 / Math.PI);

      return {
        id: element.id,
        name: element.name,
        type,
        height,
        width,
        angle,
        position: {
          x: allX.reduce((a, b) => a + b, 0) / allX.length,
          y: allY.reduce((a, b) => a + b, 0) / allY.length,
          z: allZ.reduce((a, b) => a + b, 0) / allZ.length,
        },
        vertices: uniqueVertexIds,
      };
    }
  }

  // Default fallback
  const allX = vertices.map((v) => v.x);
  const allY = vertices.map((v) => v.y);
  const allZ = vertices.map((v) => v.z);

  return {
    id: element.id,
    name: element.name,
    type,
    height: Math.max(...allZ) - Math.min(...allZ),
    width:
      Math.max(...allX) - Math.min(...allX) ||
      Math.max(...allY) - Math.min(...allY),
    position: {
      x: allX.reduce((a, b) => a + b, 0) / allX.length,
      y: allY.reduce((a, b) => a + b, 0) / allY.length,
      z: allZ.reduce((a, b) => a + b, 0) / allZ.length,
    },
    vertices: uniqueVertexIds,
  };
}

export function applyPropertyChanges(
  element: ElementProperties,
  property: string,
  value: number,
  allVertices: Vertex[]
): Vertex[] {
  const updatedVertices = [...allVertices];

  const getVertex = (id: number) => updatedVertices.find((v) => v.id === id);
  const elementVertices = element.vertices
    .map((id) => getVertex(id))
    .filter(Boolean) as Vertex[];

  switch (property) {
    case "height":
      // Adjust Z coordinates proportionally
      const currentHeight =
        Math.max(...elementVertices.map((v) => v.z)) -
        Math.min(...elementVertices.map((v) => v.z));
      const minZ = Math.min(...elementVertices.map((v) => v.z));
      const scale = currentHeight > 0 ? value / currentHeight : 1;

      element.vertices.forEach((vId) => {
        const vertex = updatedVertices.find((v) => v.id === vId);
        if (vertex) {
          vertex.z = minZ + (vertex.z - minZ) * scale;
        }
      });
      break;

    case "width":
      // Adjust X or Y coordinates based on orientation
      const xRange =
        Math.max(...elementVertices.map((v) => v.x)) -
        Math.min(...elementVertices.map((v) => v.x));
      const yRange =
        Math.max(...elementVertices.map((v) => v.y)) -
        Math.min(...elementVertices.map((v) => v.y));

      if (xRange > yRange) {
        // Adjust X
        const centerX = element.position.x;
        element.vertices.forEach((vId) => {
          const vertex = updatedVertices.find((v) => v.id === vId);
          if (vertex) {
            const offset = vertex.x - centerX;
            vertex.x = centerX + (offset * value) / xRange;
          }
        });
      } else {
        // Adjust Y
        const centerY = element.position.y;
        element.vertices.forEach((vId) => {
          const vertex = updatedVertices.find((v) => v.id === vId);
          if (vertex) {
            const offset = vertex.y - centerY;
            vertex.y = centerY + (offset * value) / yRange;
          }
        });
      }
      break;

    case "positionX":
      const deltaX = value - element.position.x;
      element.vertices.forEach((vId) => {
        const vertex = updatedVertices.find((v) => v.id === vId);
        if (vertex) vertex.x += deltaX;
      });
      break;

    case "positionY":
      const deltaY = value - element.position.y;
      element.vertices.forEach((vId) => {
        const vertex = updatedVertices.find((v) => v.id === vId);
        if (vertex) vertex.y += deltaY;
      });
      break;

    case "positionZ":
      const deltaZ = value - element.position.z;
      element.vertices.forEach((vId) => {
        const vertex = updatedVertices.find((v) => v.id === vId);
        if (vertex) vertex.z += deltaZ;
      });
      break;
  }

  return updatedVertices;
}
