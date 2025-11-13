"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { HouseGeometry3D } from "@/components/HouseGeometry3D";
import { ElementProperties, HouseData } from "@/types/geometry";

interface HouseCanvasProps {
  data: HouseData;
  scale?: number;
  showLabels?: boolean;
  showVertices?: boolean;
  highlightElement?: ElementProperties | null;
}

export const HouseCanvas: React.FC<HouseCanvasProps> = ({
  data,
  scale = 0.1,
  showLabels = true,
  showVertices = false,
}) => {
  // Calculate camera position based on data bounds
  const cameraPosition = useMemo(() => {
    const maxX = Math.max(...data.vertices.map((v) => v.x));
    const maxY = Math.max(...data.vertices.map((v) => v.y));
    const maxZ = Math.max(...data.vertices.map((v) => v.z));
    const maxDim = Math.max(maxX, maxY, maxZ) * scale;
    return [maxDim * 2, maxDim * 1.5, maxDim * 2] as [number, number, number];
  }, [data, scale]);

  const centerTarget = useMemo(() => {
    const avgX =
      data.vertices.reduce((sum, v) => sum + v.x, 0) / data.vertices.length;
    const avgY =
      data.vertices.reduce((sum, v) => sum + v.y, 0) / data.vertices.length;
    const avgZ =
      data.vertices.reduce((sum, v) => sum + v.z, 0) / data.vertices.length;
    return [avgX * scale, avgZ * scale, avgY * scale] as [
      number,
      number,
      number
    ];
  }, [data, scale]);

  return (
    <div className="w-full h-full" data-testid="house-canvas">
      <Canvas>
        <PerspectiveCamera makeDefault position={cameraPosition} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={centerTarget}
        />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <HouseGeometry3D
            data={data}
            scale={scale}
            showLabels={showLabels}
            showVertices={showVertices}
          />
          <Grid
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={30}
            fadeStrength={1}
            infiniteGrid
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
