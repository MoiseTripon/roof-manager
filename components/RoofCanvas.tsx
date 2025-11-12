"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { RoofGeometry3D } from "@/components/RoofGeometry3D";
import { Wall, RoofSide, RidgeConfig } from "@/types/roof";

interface RoofCanvasProps {
  walls: Wall[];
  roofSides: RoofSide[];
  ridge: RidgeConfig;
  span: number;
  width: number;
  units?: "imperial" | "metric";
}

export const RoofCanvas: React.FC<RoofCanvasProps> = ({
  walls,
  roofSides,
  ridge,
  span,
  width,
  units = "imperial",
}) => {
  // Normalize dimensions for consistent visualization
  const conversionFactor = units === "metric" ? 3.28084 : 1;

  const normalizedWalls = walls.map((wall) => ({
    ...wall,
    height: wall.height * conversionFactor,
    length: wall.length * conversionFactor,
  }));

  const normalizedRoofSides = roofSides.map((side) => ({
    ...side,
    rafterLength: side.rafterLength * conversionFactor,
    horizontalRun: side.horizontalRun * conversionFactor,
    verticalRise: side.verticalRise * conversionFactor,
  }));

  const normalizedRidge = {
    offset: ridge.offset * conversionFactor,
    height: ridge.height * conversionFactor,
  };

  return (
    <div className="w-full h-full" data-testid="roof-canvas">
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 6, 8]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 1, 0]}
        />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <RoofGeometry3D
            walls={normalizedWalls}
            roofSides={normalizedRoofSides}
            ridge={normalizedRidge}
            span={span * conversionFactor}
            width={width * conversionFactor}
            displayUnits={units}
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
