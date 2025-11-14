import React, { useMemo, useRef, useState } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { HouseData, ElementProperties } from "@/types/geometry";
import { ThreeEvent, useThree } from "@react-three/fiber";

export interface HouseGeometry3DProps {
  data: HouseData;
  scale?: number;
  showLabels?: boolean;
  showVertices?: boolean;
  highlightElement?: ElementProperties | null;
  onElementSelect?: (elementType: string, elementId: number) => void;
  onVertexDrag?: (
    vertexId: number,
    newPosition: { x: number; y: number; z: number }
  ) => void;
}

export const HouseGeometry3D: React.FC<HouseGeometry3DProps> = ({
  data,
  scale = 0.1,
  showLabels = true,
  showVertices = false,
  highlightElement,
  onElementSelect,
  onVertexDrag,
}) => {
  const { vertices, walls, roof } = data;
  const { camera, gl } = useThree();
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedVertexRef = useRef<number | null>(null);

  // Create a map for quick vertex lookup
  const vertexMap = useMemo(() => {
    const map = new Map<number, THREE.Vector3>();
    vertices.forEach((v) => {
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
    const uniqueIds =
      vertexIds[0] === vertexIds[vertexIds.length - 1]
        ? vertexIds.slice(0, -1)
        : vertexIds;

    if (uniqueIds.length < 3) return null;

    const positions: number[] = [];
    const indices: number[] = [];

    uniqueIds.forEach((id) => {
      const v = getVertex(id);
      positions.push(v.x, v.y, v.z);
    });

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

  // Check if element is highlighted or hovered
  const isElementActive = (type: string, id: number) => {
    const elementKey = `${type}-${id}`;
    const isHighlighted =
      highlightElement &&
      `${highlightElement.type}-${highlightElement.id}` === elementKey;
    const isHovered = hoveredElement === elementKey;
    return { isHighlighted, isHovered };
  };

  // Handle element click
  const handleElementClick = (
    e: ThreeEvent<MouseEvent>,
    type: string,
    id: number
  ) => {
    e.stopPropagation();
    if (!isDragging && onElementSelect) {
      onElementSelect(type, id);
    }
  };

  // Handle element hover
  const handleElementHover = (elementKey: string | null) => {
    if (!isDragging) {
      setHoveredElement(elementKey);
      gl.domElement.style.cursor = elementKey ? "pointer" : "default";
    }
  };

  // Handle vertex drag start
  const handleVertexDragStart = (
    e: ThreeEvent<PointerEvent>,
    vertexId: number
  ) => {
    e.stopPropagation();
    if (onVertexDrag) {
      setIsDragging(true);
      draggedVertexRef.current = vertexId;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Handle vertex drag
  const handleVertexDrag = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && draggedVertexRef.current !== null && onVertexDrag) {
      e.stopPropagation();

      // Get the intersection point with a horizontal plane at the vertex's current height
      const vertex = vertices.find((v) => v.id === draggedVertexRef.current);
      if (!vertex) return;

      const plane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -vertex.z * scale
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(e.pointer, camera);

      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      if (intersectionPoint) {
        // Convert back from Three.js coordinates to original coordinates
        onVertexDrag(draggedVertexRef.current, {
          x: intersectionPoint.x / scale,
          y: intersectionPoint.z / scale,
          z: vertex.z,
        });
      }
    }
  };

  // Handle vertex drag end
  const handleVertexDragEnd = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      draggedVertexRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      gl.domElement.style.cursor = "default";
    }
  };

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#e5e7eb" transparent opacity={0.3} />
      </mesh>

      {/* Render walls */}
      {walls.elements.map((wall) => {
        const { isHighlighted, isHovered } = isElementActive("wall", wall.id);
        const opacity = isHighlighted ? 0.6 : isHovered ? 0.45 : 0.3;
        const color = isHighlighted
          ? "#3b82f6"
          : isHovered
          ? "#60a5fa"
          : "#d1d5db";

        return (
          <group key={`wall-${wall.id}`}>
            {/* Wall outline */}
            <Line
              points={createLinePoints(wall.vertices)}
              color={walls.contourColor}
              lineWidth={isHighlighted ? 3 : isHovered ? 2.5 : 2}
            />
            {/* Wall surface - clickable */}
            {createPolygonGeometry(wall.vertices) && (
              <mesh
                geometry={createPolygonGeometry(wall.vertices)!}
                onClick={(e) => handleElementClick(e, "wall", wall.id)}
                onPointerEnter={() => handleElementHover(`wall-${wall.id}`)}
                onPointerLeave={() => handleElementHover(null)}
              >
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Wall label */}
            {showLabels && (
              <Text
                position={getPolygonCenter(wall.vertices)}
                fontSize={isHighlighted ? 0.18 : 0.15}
                color={isHighlighted ? "#1e40af" : "#4b5563"}
                anchorX="center"
                anchorY="middle"
                fontWeight={isHighlighted ? "bold" : "normal"}
              >
                {wall.name}
              </Text>
            )}
          </group>
        );
      })}

      {/* Render roof */}
      {roof.elements.map((roofElement) => {
        const { isHighlighted, isHovered } = isElementActive(
          "roof",
          roofElement.id
        );
        const opacity = isHighlighted ? 0.7 : isHovered ? 0.55 : 0.4;
        const color = isHighlighted
          ? "#f59e0b"
          : isHovered
          ? "#fbbf24"
          : "#fbbf24";

        return (
          <group key={`roof-${roofElement.id}`}>
            {/* Roof outline */}
            <Line
              points={createLinePoints(roofElement.vertices)}
              color={roof.contourColor}
              lineWidth={isHighlighted ? 4 : isHovered ? 3.5 : 3}
            />
            {/* Roof surface - clickable */}
            {createPolygonGeometry(roofElement.vertices) && (
              <mesh
                geometry={createPolygonGeometry(roofElement.vertices)!}
                onClick={(e) => handleElementClick(e, "roof", roofElement.id)}
                onPointerEnter={() =>
                  handleElementHover(`roof-${roofElement.id}`)
                }
                onPointerLeave={() => handleElementHover(null)}
              >
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Roof label */}
            {showLabels && (
              <Text
                position={getPolygonCenter(roofElement.vertices)}
                fontSize={isHighlighted ? 0.15 : 0.12}
                color={isHighlighted ? "#b45309" : "#ef4444"}
                anchorX="center"
                anchorY="middle"
                fontWeight={isHighlighted ? "bold" : "normal"}
              >
                {roofElement.name}
              </Text>
            )}
          </group>
        );
      })}

      {/* Render vertex markers (draggable when showVertices is true) */}
      {showVertices &&
        vertices.map((vertex) => {
          const isVertexHighlighted =
            highlightElement?.vertices.includes(vertex.id) ?? false;

          return (
            <group key={`vertex-${vertex.id}`}>
              <mesh
                position={getVertex(vertex.id)}
                onPointerDown={(e) => handleVertexDragStart(e, vertex.id)}
                onPointerMove={handleVertexDrag}
                onPointerUp={handleVertexDragEnd}
                onPointerEnter={() => {
                  gl.domElement.style.cursor = "grab";
                }}
                onPointerLeave={() => {
                  if (!isDragging) {
                    gl.domElement.style.cursor = "default";
                  }
                }}
              >
                <sphereGeometry args={[isVertexHighlighted ? 0.07 : 0.05]} />
                <meshBasicMaterial
                  color={isVertexHighlighted ? "#ef4444" : "#3b82f6"}
                />
              </mesh>
              <Text
                position={getVertex(vertex.id)
                  .clone()
                  .add(new THREE.Vector3(0.1, 0.1, 0))}
                fontSize={0.1}
                color={isVertexHighlighted ? "#ef4444" : "#3b82f6"}
              >
                {vertex.id}
              </Text>
            </group>
          );
        })}
    </group>
  );
};
