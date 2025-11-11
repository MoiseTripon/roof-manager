import React from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

export interface RoofGeometryProps {
  run: number;
  rise: number;
  span: number;
  ridgeOffset?: number;
}

export const RoofGeometry: React.FC<RoofGeometryProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
}) => {
  // Scale down for better visualization
  const scale = 0.1;
  const scaledRun = run * scale;
  const scaledRise = rise * scale;
  const scaledSpan = span * scale;
  const scaledRidgeOffset = ridgeOffset * scale;

  // Define points for the roof structure
  // Base points - walls are at the edges of the span
  const leftWall = new THREE.Vector3(-scaledSpan / 2, 0, 0);
  const rightWall = new THREE.Vector3(scaledSpan / 2, 0, 0);

  // Ridge position - offset from center
  const ridge = new THREE.Vector3(scaledRidgeOffset, scaledRise, 0);

  // Extended base for walls
  const leftBase = new THREE.Vector3(-scaledSpan / 2, -0.5, 0);
  const rightBase = new THREE.Vector3(scaledSpan / 2, -0.5, 0);

  // Calculate angles for display
  const leftRun = span / 2 - ridgeOffset;
  const rightRun = span / 2 + ridgeOffset;
  const leftAngle = Math.atan(rise / leftRun) * (180 / Math.PI);
  const rightAngle = Math.atan(rise / rightRun) * (180 / Math.PI);

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
          new THREE.Vector3(scaledRidgeOffset, scaledRise, -0.5),
          new THREE.Vector3(scaledRidgeOffset, scaledRise, 0.5),
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

      {/* Vertical line from ridge to base (to show offset) */}
      {ridgeOffset !== 0 && (
        <Line
          points={[new THREE.Vector3(scaledRidgeOffset, 0, 0), ridge]}
          color="#f59e0b"
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.05}
          data-testid="ridge-vertical"
        />
      )}

      {/* Center line (reference) */}
      {ridgeOffset !== 0 && (
        <Line
          points={[
            new THREE.Vector3(0, -0.5, 0),
            new THREE.Vector3(0, scaledRise + 0.2, 0),
          ]}
          color="#d1d5db"
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.1}
          data-testid="center-line"
        />
      )}

      {/* Angle indicators */}
      {ridgeOffset !== 0 && (
        <>
          {/* Left angle text */}
          <Text
            position={[-scaledSpan / 4, scaledRise / 4, 0.3]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {leftAngle.toFixed(1)}°
          </Text>

          {/* Right angle text */}
          <Text
            position={[scaledSpan / 4, scaledRise / 4, 0.3]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {rightAngle.toFixed(1)}°
          </Text>
        </>
      )}

      {/* Ridge offset indicator */}
      {ridgeOffset !== 0 && (
        <Text
          position={[scaledRidgeOffset, scaledRise + 0.3, 0]}
          fontSize={0.12}
          color="#f59e0b"
          anchorX="center"
          anchorY="bottom"
        >
          {ridgeOffset > 0
            ? `+${ridgeOffset.toFixed(1)}`
            : ridgeOffset.toFixed(1)}
        </Text>
      )}
    </group>
  );
};
