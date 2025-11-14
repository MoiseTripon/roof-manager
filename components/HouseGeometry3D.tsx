import React, { useMemo, useRef, useState } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { HouseData, ElementProperties } from "@/types/geometry";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { DragMode } from "@/types/interaction";

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
  onMultiVertexDrag?: (
    vertexUpdates: Array<{
      id: number;
      position: { x: number; y: number; z: number };
    }>
  ) => void;
  dragMode?: DragMode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

interface EdgeInfo {
  vertexIds: [number, number];
  elementType: string;
  elementId: number;
}

export const HouseGeometry3D: React.FC<HouseGeometry3DProps> = ({
  data,
  scale = 0.1,
  showLabels = true,
  showVertices = false,
  highlightElement,
  onElementSelect,
  onVertexDrag,
  onMultiVertexDrag,
  dragMode = "vertex",
  onDragStart,
  onDragEnd,
}) => {
  const { vertices, walls, roof } = data;
  const { camera, gl } = useThree();
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedVertexRef = useRef<number | null>(null);
  const draggedEdgeRef = useRef<EdgeInfo | null>(null);
  const draggedElementRef = useRef<{
    type: string;
    id: number;
    vertexIds: number[];
  } | null>(null);
  const dragStartPosRef = useRef<THREE.Vector3 | null>(null);
  const initialVertexPositionsRef = useRef<
    Map<number, { x: number; y: number; z: number }>
  >(new Map());

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

  // Get edges from vertex IDs
  const getEdges = (vertexIds: number[]): [number, number][] => {
    const edges: [number, number][] = [];
    const uniqueIds =
      vertexIds[0] === vertexIds[vertexIds.length - 1]
        ? vertexIds.slice(0, -1)
        : vertexIds;

    for (let i = 0; i < uniqueIds.length; i++) {
      const next = (i + 1) % uniqueIds.length;
      edges.push([uniqueIds[i], uniqueIds[next]]);
    }
    return edges;
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
      if (dragMode === "element" && elementKey) {
        gl.domElement.style.cursor = "move";
      } else if (elementKey) {
        gl.domElement.style.cursor = "pointer";
      } else {
        gl.domElement.style.cursor = "default";
      }
    }
  };

  // Get intersection point on plane
  const getIntersectionPoint = (
    e: ThreeEvent<PointerEvent>,
    planeY: number
  ): THREE.Vector3 | null => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(e.pointer, camera);

    const intersectionPoint = new THREE.Vector3();
    const result = raycaster.ray.intersectPlane(plane, intersectionPoint);
    return result ? intersectionPoint : null;
  };

  // Handle vertex drag start
  const handleVertexDragStart = (
    e: ThreeEvent<PointerEvent>,
    vertexId: number
  ) => {
    if (dragMode !== "vertex") return;
    e.stopPropagation();
    if (onVertexDrag) {
      setIsDragging(true);
      draggedVertexRef.current = vertexId;
      onDragStart?.();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Handle edge drag start
  const handleEdgeDragStart = (e: ThreeEvent<PointerEvent>, edge: EdgeInfo) => {
    if (dragMode !== "edge") return;
    e.stopPropagation();
    if (onMultiVertexDrag) {
      setIsDragging(true);
      draggedEdgeRef.current = edge;

      // Store initial positions
      const v1 = vertices.find((v) => v.id === edge.vertexIds[0]);
      const v2 = vertices.find((v) => v.id === edge.vertexIds[1]);
      if (v1 && v2) {
        initialVertexPositionsRef.current.set(v1.id, {
          x: v1.x,
          y: v1.y,
          z: v1.z,
        });
        initialVertexPositionsRef.current.set(v2.id, {
          x: v2.x,
          y: v2.y,
          z: v2.z,
        });

        // Get drag start position
        const avgZ = (v1.z + v2.z) / 2;
        const intersection = getIntersectionPoint(e, avgZ * scale);
        if (intersection) {
          dragStartPosRef.current = intersection;
        }
      }

      onDragStart?.();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Handle element drag start
  const handleElementDragStart = (
    e: ThreeEvent<PointerEvent>,
    type: string,
    id: number,
    vertexIds: number[]
  ) => {
    if (dragMode !== "element") return;
    e.stopPropagation();
    if (onMultiVertexDrag) {
      setIsDragging(true);
      draggedElementRef.current = { type, id, vertexIds };

      // Store initial positions
      const uniqueIds =
        vertexIds[0] === vertexIds[vertexIds.length - 1]
          ? vertexIds.slice(0, -1)
          : vertexIds;

      let totalZ = 0;
      uniqueIds.forEach((vId) => {
        const v = vertices.find((vert) => vert.id === vId);
        if (v) {
          initialVertexPositionsRef.current.set(v.id, {
            x: v.x,
            y: v.y,
            z: v.z,
          });
          totalZ += v.z;
        }
      });

      // Get drag start position
      const avgZ = totalZ / uniqueIds.length;
      const intersection = getIntersectionPoint(e, avgZ * scale);
      if (intersection) {
        dragStartPosRef.current = intersection;
      }

      onDragStart?.();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Handle drag move
  const handleDragMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    if (
      dragMode === "vertex" &&
      draggedVertexRef.current !== null &&
      onVertexDrag
    ) {
      const vertex = vertices.find((v) => v.id === draggedVertexRef.current);
      if (!vertex) return;

      const intersection = getIntersectionPoint(e, vertex.z * scale);
      if (intersection) {
        onVertexDrag(draggedVertexRef.current, {
          x: intersection.x / scale,
          y: intersection.z / scale,
          z: vertex.z,
        });
      }
    } else if (
      dragMode === "edge" &&
      draggedEdgeRef.current &&
      dragStartPosRef.current &&
      onMultiVertexDrag
    ) {
      const v1Initial = initialVertexPositionsRef.current.get(
        draggedEdgeRef.current.vertexIds[0]
      );
      const v2Initial = initialVertexPositionsRef.current.get(
        draggedEdgeRef.current.vertexIds[1]
      );
      if (!v1Initial || !v2Initial) return;

      const avgZ = (v1Initial.z + v2Initial.z) / 2;
      const intersection = getIntersectionPoint(e, avgZ * scale);
      if (intersection) {
        const delta = intersection.clone().sub(dragStartPosRef.current);

        onMultiVertexDrag([
          {
            id: draggedEdgeRef.current.vertexIds[0],
            position: {
              x: v1Initial.x + delta.x / scale,
              y: v1Initial.y + delta.z / scale,
              z: v1Initial.z,
            },
          },
          {
            id: draggedEdgeRef.current.vertexIds[1],
            position: {
              x: v2Initial.x + delta.x / scale,
              y: v2Initial.y + delta.z / scale,
              z: v2Initial.z,
            },
          },
        ]);
      }
    } else if (
      dragMode === "element" &&
      draggedElementRef.current &&
      dragStartPosRef.current &&
      onMultiVertexDrag
    ) {
      const uniqueIds =
        draggedElementRef.current.vertexIds[0] ===
        draggedElementRef.current.vertexIds[
          draggedElementRef.current.vertexIds.length - 1
        ]
          ? draggedElementRef.current.vertexIds.slice(0, -1)
          : draggedElementRef.current.vertexIds;

      let totalZ = 0;
      uniqueIds.forEach((id) => {
        const initial = initialVertexPositionsRef.current.get(id);
        if (initial) totalZ += initial.z;
      });
      const avgZ = totalZ / uniqueIds.length;

      const intersection = getIntersectionPoint(e, avgZ * scale);
      if (intersection) {
        const delta = intersection.clone().sub(dragStartPosRef.current);

        const updates = uniqueIds
          .map((id) => {
            const initial = initialVertexPositionsRef.current.get(id);
            if (!initial) return null;
            return {
              id,
              position: {
                x: initial.x + delta.x / scale,
                y: initial.y + delta.z / scale,
                z: initial.z,
              },
            };
          })
          .filter(Boolean) as Array<{
          id: number;
          position: { x: number; y: number; z: number };
        }>;

        onMultiVertexDrag(updates);
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      draggedVertexRef.current = null;
      draggedEdgeRef.current = null;
      draggedElementRef.current = null;
      dragStartPosRef.current = null;
      initialVertexPositionsRef.current.clear();
      onDragEnd?.();
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      gl.domElement.style.cursor = "default";
    }
  };

  return (
    <group onPointerMove={handleDragMove} onPointerUp={handleDragEnd}>
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
            {/* Wall surface - clickable and draggable */}
            {createPolygonGeometry(wall.vertices) && (
              <mesh
                geometry={createPolygonGeometry(wall.vertices)!}
                onClick={(e) => handleElementClick(e, "wall", wall.id)}
                onPointerDown={(e) =>
                  handleElementDragStart(e, "wall", wall.id, wall.vertices)
                }
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

            {/* Draggable edges */}
            {dragMode === "edge" &&
              getEdges(wall.vertices).map((edge, idx) => {
                const edgeKey = `wall-${wall.id}-edge-${idx}`;
                const isEdgeHovered = hoveredEdge === edgeKey;
                const p1 = getVertex(edge[0]);
                const p2 = getVertex(edge[1]);
                const edgeMidpoint = p1.clone().add(p2).multiplyScalar(0.5);

                return (
                  <mesh
                    key={edgeKey}
                    position={edgeMidpoint}
                    onPointerDown={(e) =>
                      handleEdgeDragStart(e, {
                        vertexIds: edge,
                        elementType: "wall",
                        elementId: wall.id,
                      })
                    }
                    onPointerEnter={() => {
                      setHoveredEdge(edgeKey);
                      gl.domElement.style.cursor = "grab";
                    }}
                    onPointerLeave={() => {
                      setHoveredEdge(null);
                      if (!isDragging) gl.domElement.style.cursor = "default";
                    }}
                  >
                    <sphereGeometry args={[isEdgeHovered ? 0.08 : 0.06]} />
                    <meshBasicMaterial
                      color={isEdgeHovered ? "#10b981" : "#34d399"}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                );
              })}

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
            {/* Roof surface - clickable and draggable */}
            {createPolygonGeometry(roofElement.vertices) && (
              <mesh
                geometry={createPolygonGeometry(roofElement.vertices)!}
                onClick={(e) => handleElementClick(e, "roof", roofElement.id)}
                onPointerDown={(e) =>
                  handleElementDragStart(
                    e,
                    "roof",
                    roofElement.id,
                    roofElement.vertices
                  )
                }
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

            {/* Draggable edges */}
            {dragMode === "edge" &&
              getEdges(roofElement.vertices).map((edge, idx) => {
                const edgeKey = `roof-${roofElement.id}-edge-${idx}`;
                const isEdgeHovered = hoveredEdge === edgeKey;
                const p1 = getVertex(edge[0]);
                const p2 = getVertex(edge[1]);
                const edgeMidpoint = p1.clone().add(p2).multiplyScalar(0.5);

                return (
                  <mesh
                    key={edgeKey}
                    position={edgeMidpoint}
                    onPointerDown={(e) =>
                      handleEdgeDragStart(e, {
                        vertexIds: edge,
                        elementType: "roof",
                        elementId: roofElement.id,
                      })
                    }
                    onPointerEnter={() => {
                      setHoveredEdge(edgeKey);
                      gl.domElement.style.cursor = "grab";
                    }}
                    onPointerLeave={() => {
                      setHoveredEdge(null);
                      if (!isDragging) gl.domElement.style.cursor = "default";
                    }}
                  >
                    <sphereGeometry args={[isEdgeHovered ? 0.08 : 0.06]} />
                    <meshBasicMaterial
                      color={isEdgeHovered ? "#10b981" : "#34d399"}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                );
              })}

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

      {/* Render vertex markers (draggable when showVertices is true and in vertex mode) */}
      {showVertices &&
        vertices.map((vertex) => {
          const isVertexHighlighted =
            highlightElement?.vertices.includes(vertex.id) ?? false;

          return (
            <group key={`vertex-${vertex.id}`}>
              <mesh
                position={getVertex(vertex.id)}
                onPointerDown={(e) => handleVertexDragStart(e, vertex.id)}
                onPointerEnter={() => {
                  if (dragMode === "vertex") {
                    gl.domElement.style.cursor = "grab";
                  }
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
