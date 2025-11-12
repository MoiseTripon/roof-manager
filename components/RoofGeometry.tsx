import React from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

export interface RoofGeometryProps {
  run: number;
  rise: number;
  span: number;
  ridgeOffset?: number;
  leftWallHeight?: number;
  rightWallHeight?: number;
}

export const RoofGeometry: React.FC<RoofGeometryProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
  leftWallHeight = 8,
  rightWallHeight = 8,
}) => {
  // Scale down for better visualization
  const scale = 0.1;
  const scaledRun = run * scale;
  const scaledRise = rise * scale;
  const scaledSpan = span * scale;
  const scaledRidgeOffset = ridgeOffset * scale;
  const scaledLeftWallHeight = leftWallHeight * scale;
  const scaledRightWallHeight = rightWallHeight * scale;

  // Calculate the reference height (average or minimum wall height)
  const minWallHeight = Math.min(scaledLeftWallHeight, scaledRightWallHeight);
  const avgWallHeight = (scaledLeftWallHeight + scaledRightWallHeight) / 2;

  // Define points for the roof structure
  // Base points - walls are at the edges of the span
  const leftWallTop = new THREE.Vector3(
    -scaledSpan / 2,
    scaledLeftWallHeight,
    0
  );
  const rightWallTop = new THREE.Vector3(
    scaledSpan / 2,
    scaledRightWallHeight,
    0
  );

  // Ridge position - offset from center, height calculated from average wall height
  const ridgeHeight = avgWallHeight + scaledRise;
  const ridge = new THREE.Vector3(scaledRidgeOffset, ridgeHeight, 0);

  // Ground level points
  const leftBase = new THREE.Vector3(-scaledSpan / 2, 0, 0);
  const rightBase = new THREE.Vector3(scaledSpan / 2, 0, 0);

  // Calculate angles for display based on actual geometry
  const leftDeltaX = scaledSpan / 2 - scaledRidgeOffset;
  const rightDeltaX = scaledSpan / 2 + scaledRidgeOffset;
  const leftDeltaY = ridgeHeight - scaledLeftWallHeight;
  const rightDeltaY = ridgeHeight - scaledRightWallHeight;

  const leftAngle = Math.atan(leftDeltaY / leftDeltaX) * (180 / Math.PI);
  const rightAngle = Math.atan(rightDeltaY / rightDeltaX) * (180 / Math.PI);

  // Check if walls have different heights
  const hasDifferentWallHeights =
    Math.abs(scaledLeftWallHeight - scaledRightWallHeight) > 0.001;

  return (
    <group>
      {/* Left Rafter */}
      <Line
        points={[leftWallTop, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="left-rafter"
      />

      {/* Right Rafter */}
      <Line
        points={[rightWallTop, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="right-rafter"
      />

      {/* Ceiling Joist / Connection between wall tops */}
      <Line
        points={[leftWallTop, rightWallTop]}
        color="#3b82f6"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
        data-testid="span-line"
      />

      {/* Left Wall */}
      <Line
        points={[leftBase, leftWallTop]}
        color="#6b7280"
        lineWidth={3}
        data-testid="left-wall"
      />

      {/* Right Wall */}
      <Line
        points={[rightBase, rightWallTop]}
        color="#6b7280"
        lineWidth={3}
        data-testid="right-wall"
      />

      {/* Ridge Line (visual enhancement) */}
      <Line
        points={[
          new THREE.Vector3(scaledRidgeOffset, ridgeHeight, -0.5),
          new THREE.Vector3(scaledRidgeOffset, ridgeHeight, 0.5),
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

      {/* Vertical line from ridge to ground (to show height) */}
      <Line
        points={[new THREE.Vector3(scaledRidgeOffset, 0, 0), ridge]}
        color="#f59e0b"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.05}
        data-testid="ridge-vertical"
      />

      {/* Center line (reference) */}
      {(ridgeOffset !== 0 || hasDifferentWallHeights) && (
        <Line
          points={[
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, ridgeHeight + 0.2, 0),
          ]}
          color="#d1d5db"
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.1}
          data-testid="center-line"
        />
      )}

      {/* Horizontal reference at average wall height */}
      {hasDifferentWallHeights && (
        <Line
          points={[
            new THREE.Vector3(-scaledSpan / 2 - 0.3, avgWallHeight, 0),
            new THREE.Vector3(scaledSpan / 2 + 0.3, avgWallHeight, 0),
          ]}
          color="#a855f7"
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.1}
          data-testid="avg-height-line"
        />
      )}

      {/* Angle indicators */}
      {(ridgeOffset !== 0 || hasDifferentWallHeights) && (
        <>
          {/* Left angle text */}
          <Text
            position={[
              -scaledSpan / 4,
              scaledLeftWallHeight + leftDeltaY / 2,
              0.3,
            ]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {leftAngle.toFixed(1)}°
          </Text>

          {/* Right angle text */}
          <Text
            position={[
              scaledSpan / 4,
              scaledRightWallHeight + rightDeltaY / 2,
              0.3,
            ]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {rightAngle.toFixed(1)}°
          </Text>
        </>
      )}

      {/* Ridge height indicator */}
      <Text
        position={[scaledRidgeOffset, ridgeHeight + 0.3, 0]}
        fontSize={0.12}
        color="#f59e0b"
        anchorX="center"
        anchorY="bottom"
      >
        {(ridgeHeight / scale).toFixed(1)}
      </Text>

      {/* Wall height indicators */}
      {hasDifferentWallHeights && (
        <>
          <Text
            position={[-scaledSpan / 2 - 0.4, scaledLeftWallHeight / 2, 0]}
            fontSize={0.1}
            color="#6b7280"
            anchorX="right"
            anchorY="middle"
          >
            {leftWallHeight.toFixed(1)}
          </Text>

          <Text
            position={[scaledSpan / 2 + 0.4, scaledRightWallHeight / 2, 0]}
            fontSize={0.1}
            color="#6b7280"
            anchorX="left"
            anchorY="middle"
          >
            {rightWallHeight.toFixed(1)}
          </Text>
        </>
      )}

      {/* Ridge offset indicator (only if offset) */}
      {ridgeOffset !== 0 && (
        <Text
          position={[scaledRidgeOffset / 2, ridgeHeight + 0.5, 0]}
          fontSize={0.1}
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
