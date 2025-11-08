import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface RoofGeometryProps {
  run: number;
  rise: number;
  span: number;
}

export const RoofGeometry: React.FC<RoofGeometryProps> = ({
  run,
  rise,
  span,
}) => {
  // Scale down for better visualization
  const scale = 0.1;
  const scaledRun = run * scale;
  const scaledRise = rise * scale;
  const scaledSpan = span * scale;

  // Define points for the roof structure
  // Base points
  const leftWall = new THREE.Vector3(-scaledRun, 0, 0);
  const rightWall = new THREE.Vector3(scaledRun, 0, 0);
  const ridge = new THREE.Vector3(0, scaledRise, 0);

  // Extended base for walls
  const leftBase = new THREE.Vector3(-scaledRun, -0.5, 0);
  const rightBase = new THREE.Vector3(scaledRun, -0.5, 0);

  return (
    <group>
      {/* Left Rafter */}
      <Line
        points={[leftWall, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="left-rafter"
      />

      {/* Right Rafter */}
      <Line
        points={[rightWall, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="right-rafter"
      />

      {/* Ceiling Joist / Span */}
      <Line
        points={[leftWall, rightWall]}
        color="#3b82f6"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
        data-testid="span-line"
      />

      {/* Left Wall */}
      <Line
        points={[leftBase, leftWall]}
        color="#6b7280"
        lineWidth={2}
        data-testid="left-wall"
      />

      {/* Right Wall */}
      <Line
        points={[rightBase, rightWall]}
        color="#6b7280"
        lineWidth={2}
        data-testid="right-wall"
      />

      {/* Ridge Line (visual enhancement) */}
      <Line
        points={[
          new THREE.Vector3(0, scaledRise, -0.5),
          new THREE.Vector3(0, scaledRise, 0.5),
        ]}
        color="#10b981"
        lineWidth={2}
        data-testid="ridge-line"
      />

      {/* Ground Line */}
      <Line
        points={[leftBase, rightBase]}
        color="#6b7280"
        lineWidth={1}
        data-testid="ground-line"
      />
    </group>
  );
};
