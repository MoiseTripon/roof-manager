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
  wall1Height?: number;
  wall2Height?: number;
  wall1Angle?: number;
  wall2Angle?: number;
  units?: "imperial" | "metric";
}

export const RoofCanvas: React.FC<RoofCanvasProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
  wall1Height = 8,
  wall2Height = 8,
  wall1Angle = 0,
  wall2Angle = 0,
  units = "imperial",
}) => {
  const normalizedSpan = units === "metric" ? span * 3.28084 : span;
  const normalizedRun = units === "metric" ? run * 3.28084 : run;
  const normalizedRise = units === "metric" ? rise * 3.28084 : rise;
  const normalizedRidgeOffset =
    units === "metric" ? ridgeOffset * 3.28084 : ridgeOffset;
  const normalizedWall1Height =
    units === "metric" ? wall1Height * 3.28084 : wall1Height;
  const normalizedWall2Height =
    units === "metric" ? wall2Height * 3.28084 : wall2Height;

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
            wall1Height={normalizedWall1Height}
            wall2Height={normalizedWall2Height}
            displayUnits={units}
            originalValues={{
              span,
              ridgeOffset,
              wall1Height,
              wall2Height,
              ridgeHeight: (wall1Height + wall2Height) / 2 + rise,
              wall1Angle,
              wall2Angle,
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
