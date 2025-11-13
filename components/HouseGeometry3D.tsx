import React, { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { HouseData, Vertex } from "@/types/geometry";

export interface HouseGeometry3DProps {
  data: HouseData;
  scale?: number;
  showLabels?: boolean;
  showVertices?: boolean;
}

export const HouseGeometry3D: React.FC<HouseGeometry3DProps> = ({
  data,
  scale = 0.1,
  showLabels = true,
  showVertices = false,
}) => {
  const { vertices, walls, roof } = data;

  // Create a map for quick vertex lookup
  const vertexMap = useMemo(() => {
    const map = new Map<number, THREE.Vector3>();
    vertices.forEach((v) => {
      // Note: Swapping y and z to convert from your coordinate system to Three.js
      map.set(v.id, new THREE.Vector3(v.x * scale, v.z * scale, v.y * scale));
    });
    return map;
  }, [vertices, scale]);

  // Helper to get vertex position
  const getVertex = (id: number): THREE.Vector3 => {
    return vertexMap.get(id) || new THREE.Vector3();
  };

  // Helper to create line points from vertex IDs
  const createLinePoints = (vertexIds: number[]): THREE.Vector3[] => {
    return vertexIds.map((id) => getVertex(id));
  };

  // Helper to create a polygon mesh from vertex IDs
  const createPolygonGeometry = (vertexIds: number[]) => {
    // Remove the closing vertex if it's the same as the first
    const uniqueIds =
      vertexIds[0] === vertexIds[vertexIds.length - 1]
        ? vertexIds.slice(0, -1)
        : vertexIds;

    if (uniqueIds.length < 3) return null;

    const positions: number[] = [];
    const indices: number[] = [];

    // Add vertices
    uniqueIds.forEach((id) => {
      const v = getVertex(id);
      positions.push(v.x, v.y, v.z);
    });

    // Triangulate (simple fan triangulation for convex polygons)
    for (let i = 1; i < uniqueIds.length - 1; i++) {
      indices.push(0, i, i + 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  };

  // Calculate center of polygon for labels
  const getPolygonCenter = (vertexIds: number[]): THREE.Vector3 => {
    const uniqueIds =
      vertexIds[0] === vertexIds[vertexIds.length - 1]
        ? vertexIds.slice(0, -1)
        : vertexIds;

    const center = new THREE.Vector3();
    uniqueIds.forEach((id) => {
      center.add(getVertex(id));
    });
    center.divideScalar(uniqueIds.length);
    return center;
  };

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#e5e7eb" transparent opacity={0.3} />
      </mesh>

      {/* Render walls */}
      {walls.elements.map((wall) => (
        <group key={`wall-${wall.id}`}>
          {/* Wall outline */}
          <Line
            points={createLinePoints(wall.vertices)}
            color={walls.contourColor}
            lineWidth={2}
          />
          {/* Wall surface */}
          {createPolygonGeometry(wall.vertices) && (
            <mesh geometry={createPolygonGeometry(wall.vertices)!}>
              <meshBasicMaterial
                color="#d1d5db"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {/* Wall label */}
          {showLabels && (
            <Text
              position={getPolygonCenter(wall.vertices)}
              fontSize={0.15}
              color="#4b5563"
              anchorX="center"
              anchorY="middle"
            >
              {wall.name}
            </Text>
          )}
        </group>
      ))}

      {/* Render roof */}
      {roof.elements.map((roofElement) => (
        <group key={`roof-${roofElement.id}`}>
          {/* Roof outline */}
          <Line
            points={createLinePoints(roofElement.vertices)}
            color={roof.contourColor}
            lineWidth={3}
          />
          {/* Roof surface */}
          {createPolygonGeometry(roofElement.vertices) && (
            <mesh geometry={createPolygonGeometry(roofElement.vertices)!}>
              <meshBasicMaterial
                color="#fbbf24"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {/* Roof label */}
          {showLabels && (
            <Text
              position={getPolygonCenter(roofElement.vertices)}
              fontSize={0.12}
              color="#ef4444"
              anchorX="center"
              anchorY="middle"
            >
              {roofElement.name}
            </Text>
          )}
        </group>
      ))}

      {/* Render vertex markers (optional) */}
      {showVertices &&
        vertices.map((vertex) => (
          <group key={`vertex-${vertex.id}`}>
            <mesh position={getVertex(vertex.id)}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            <Text
              position={getVertex(vertex.id)
                .clone()
                .add(new THREE.Vector3(0.1, 0.1, 0))}
              fontSize={0.1}
              color="#3b82f6"
            >
              {vertex.id}
            </Text>
          </group>
        ))}
    </group>
  );
};
