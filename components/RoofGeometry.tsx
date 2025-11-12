import React from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

export interface RoofGeometryProps {
  run: number;
  rise: number;
  span: number;
  ridgeOffset?: number;
  wall1Height?: number;
  wall2Height?: number;
  displayUnits?: "imperial" | "metric";
  originalValues?: {
    span: number;
    ridgeOffset: number;
    wall1Height: number;
    wall2Height: number;
    ridgeHeight: number;
    wall1Angle: number;
    wall2Angle: number;
  };
}

export const RoofGeometry: React.FC<RoofGeometryProps> = ({
  run,
  rise,
  span,
  ridgeOffset = 0,
  wall1Height = 8,
  wall2Height = 8,
  displayUnits = "imperial",
  originalValues,
}) => {
  const scale = 0.1;
  const scaledRun = run * scale;
  const scaledRise = rise * scale;
  const scaledSpan = span * scale;
  const scaledRidgeOffset = ridgeOffset * scale;
  const scaledWall1Height = wall1Height * scale;
  const scaledWall2Height = wall2Height * scale;

  const avgWallHeight = (scaledWall1Height + scaledWall2Height) / 2;

  // Wall positions
  const wall1Top = new THREE.Vector3(-scaledSpan / 2, scaledWall1Height, 0);
  const wall2Top = new THREE.Vector3(scaledSpan / 2, scaledWall2Height, 0);

  // Ridge position
  const ridgeHeight = avgWallHeight + scaledRise;
  const ridge = new THREE.Vector3(scaledRidgeOffset, ridgeHeight, 0);

  // Ground points
  const wall1Base = new THREE.Vector3(-scaledSpan / 2, 0, 0);
  const wall2Base = new THREE.Vector3(scaledSpan / 2, 0, 0);

  // Use pre-calculated angles from originalValues if available
  const wall1Angle = originalValues?.wall1Angle ?? 0;
  const wall2Angle = originalValues?.wall2Angle ?? 0;

  const hasDifferentWallHeights =
    Math.abs(scaledWall1Height - scaledWall2Height) > 0.001;

  const displayValues = originalValues || {
    span,
    ridgeOffset,
    wall1Height,
    wall2Height,
    ridgeHeight: (wall1Height + wall2Height) / 2 + rise,
    wall1Angle: 0,
    wall2Angle: 0,
  };

  return (
    <group>
      {/* Wall1 Rafter */}
      <Line
        points={[wall1Top, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="wall1-rafter"
      />

      {/* Wall2 Rafter */}
      <Line
        points={[wall2Top, ridge]}
        color="#ef4444"
        lineWidth={3}
        data-testid="wall2-rafter"
      />

      {/* Ceiling Joist */}
      <Line
        points={[wall1Top, wall2Top]}
        color="#3b82f6"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
        data-testid="span-line"
      />

      {/* Wall1 */}
      <Line
        points={[wall1Base, wall1Top]}
        color="#6b7280"
        lineWidth={3}
        data-testid="wall1"
      />

      {/* Wall2 */}
      <Line
        points={[wall2Base, wall2Top]}
        color="#6b7280"
        lineWidth={3}
        data-testid="wall2"
      />

      {/* Ridge Line */}
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
        points={[wall1Base, wall2Base]}
        color="#6b7280"
        lineWidth={1}
        data-testid="ground-line"
      />

      {/* Ridge vertical line */}
      <Line
        points={[new THREE.Vector3(scaledRidgeOffset, 0, 0), ridge]}
        color="#f59e0b"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.05}
        data-testid="ridge-vertical"
      />

      {/* Center reference line */}
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

      {/* Average wall height reference */}
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

      {/* Angle indicators - using calculated values from parent */}
      {(ridgeOffset !== 0 || hasDifferentWallHeights) && (
        <>
          <Text
            position={[
              (-scaledSpan / 2 + scaledRidgeOffset) / 2,
              (scaledWall1Height + ridgeHeight) / 2,
              0.3,
            ]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {wall1Angle.toFixed(1)}°
          </Text>

          <Text
            position={[
              (scaledSpan / 2 + scaledRidgeOffset) / 2,
              (scaledWall2Height + ridgeHeight) / 2,
              0.3,
            ]}
            fontSize={0.15}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {wall2Angle.toFixed(1)}°
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
        {displayValues.ridgeHeight.toFixed(1)}
      </Text>

      {/* Wall height indicators */}
      {hasDifferentWallHeights && (
        <>
          <Text
            position={[-scaledSpan / 2 - 0.4, scaledWall1Height / 2, 0]}
            fontSize={0.1}
            color="#6b7280"
            anchorX="right"
            anchorY="middle"
          >
            {displayValues.wall1Height.toFixed(1)}
          </Text>

          <Text
            position={[scaledSpan / 2 + 0.4, scaledWall2Height / 2, 0]}
            fontSize={0.1}
            color="#6b7280"
            anchorX="left"
            anchorY="middle"
          >
            {displayValues.wall2Height.toFixed(1)}
          </Text>
        </>
      )}

      {/* Ridge offset indicator */}
      {ridgeOffset !== 0 && (
        <Text
          position={[scaledRidgeOffset / 2, ridgeHeight + 0.5, 0]}
          fontSize={0.1}
          color="#f59e0b"
          anchorX="center"
          anchorY="bottom"
        >
          {displayValues.ridgeOffset > 0
            ? `+${displayValues.ridgeOffset.toFixed(1)}`
            : displayValues.ridgeOffset.toFixed(1)}
        </Text>
      )}
    </group>
  );
};
