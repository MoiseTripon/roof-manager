"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { RoofGeometry } from "@/components/RoofGeometry";

interface RoofCanvasProps {
  run: number;
  rise: number;
  span: number;
  ridgeOffset?: number;
  leftWallHeight?: number;
  rightWallHeight?: number;
  units?: "imperial" | "metric";
}

export const RoofCanvas: React.FC<RoofCanvasProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
  leftWallHeight = 8,
  rightWallHeight = 8,
  units = "imperial",
}) => {
  // Normalize dimensions to imperial feet for consistent visualization
  const normalizedSpan = units === "metric" ? span * 3.28084 : span;
  const normalizedRun = units === "metric" ? run * 3.28084 : run;
  const normalizedRise = units === "metric" ? rise * 3.28084 : rise;
  const normalizedRidgeOffset =
    units === "metric" ? ridgeOffset * 3.28084 : ridgeOffset;
  const normalizedLeftWallHeight =
    units === "metric" ? leftWallHeight * 3.28084 : leftWallHeight;
  const normalizedRightWallHeight =
    units === "metric" ? rightWallHeight * 3.28084 : rightWallHeight;

  return (
    <div className="w-full h-full" data-testid="roof-canvas">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense fallback={null}>
          <RoofGeometry
            run={normalizedRun}
            rise={normalizedRise}
            span={normalizedSpan}
            ridgeOffset={normalizedRidgeOffset}
            leftWallHeight={normalizedLeftWallHeight}
            rightWallHeight={normalizedRightWallHeight}
            displayUnits={units}
            originalValues={{
              span,
              ridgeOffset,
              leftWallHeight,
              rightWallHeight,
              ridgeHeight: (leftWallHeight + rightWallHeight) / 2 + rise,
            }}
          />
          <Grid
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={25}
            fadeStrength={1}
            infiniteGrid
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
