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
}

export const RoofCanvas: React.FC<RoofCanvasProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
  leftWallHeight = 8,
  rightWallHeight = 8,
}) => {
  return (
    <div className="w-full h-full" data-testid="roof-canvas">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense fallback={null}>
          <RoofGeometry
            run={run}
            rise={rise}
            span={span}
            ridgeOffset={ridgeOffset}
            leftWallHeight={leftWallHeight}
            rightWallHeight={rightWallHeight}
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
