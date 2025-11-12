import React from "react";
import { Line, Text, Box } from "@react-three/drei";
import * as THREE from "three";
import { Wall, RoofSide, RidgeConfig } from "@/types/roof";

export interface RoofGeometry3DProps {
  walls: Wall[];
  roofSides: RoofSide[];
  ridge: RidgeConfig;
  span: number;
  width: number;
  displayUnits?: "imperial" | "metric";
}

export const RoofGeometry3D: React.FC<RoofGeometry3DProps> = ({
  walls,
  roofSides,
  ridge,
  span,
  width,
  displayUnits = "imperial",
}) => {
  const scale = 0.1;
  const scaledSpan = span * scale;
  const scaledWidth = width * scale;
  const scaledRidgeHeight = ridge.height * scale;
  const scaledRidgeOffset = ridge.offset * scale;

  // Get wall heights
  const getWallHeight = (position: string) => {
    const wall = walls.find((w) => w.position === position);
    return wall ? wall.height * scale : 0;
  };

  const frontHeight = getWallHeight("front");
  const backHeight = getWallHeight("back");
  const leftHeight = getWallHeight("left");
  const rightHeight = getWallHeight("right");

  // Wall corner positions (counter-clockwise from top view)
  const corners = {
    frontLeft: new THREE.Vector3(-scaledSpan / 2, 0, -scaledWidth / 2),
    frontRight: new THREE.Vector3(-scaledSpan / 2, 0, scaledWidth / 2),
    backLeft: new THREE.Vector3(scaledSpan / 2, 0, -scaledWidth / 2),
    backRight: new THREE.Vector3(scaledSpan / 2, 0, scaledWidth / 2),
  };

  // Top of walls
  const wallTops = {
    frontLeft: new THREE.Vector3(
      -scaledSpan / 2,
      frontHeight,
      -scaledWidth / 2
    ),
    frontRight: new THREE.Vector3(
      -scaledSpan / 2,
      frontHeight,
      scaledWidth / 2
    ),
    backLeft: new THREE.Vector3(scaledSpan / 2, backHeight, -scaledWidth / 2),
    backRight: new THREE.Vector3(scaledSpan / 2, backHeight, scaledWidth / 2),
  };

  // Ridge line (along the width of the building)
  const ridgeLeft = new THREE.Vector3(
    scaledRidgeOffset,
    scaledRidgeHeight,
    -scaledWidth / 2
  );
  const ridgeRight = new THREE.Vector3(
    scaledRidgeOffset,
    scaledRidgeHeight,
    scaledWidth / 2
  );

  // Get roof side info
  const frontRoof = roofSides.find(
    (rs) => rs.attachedWallId === walls.find((w) => w.position === "front")?.id
  );
  const backRoof = roofSides.find(
    (rs) => rs.attachedWallId === walls.find((w) => w.position === "back")?.id
  );

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[scaledSpan * 2, scaledWidth * 2]} />
        <meshBasicMaterial color="#e5e7eb" transparent opacity={0.5} />
      </mesh>

      {/* Front wall */}
      <Line
        points={[corners.frontLeft, corners.frontRight]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[wallTops.frontLeft, wallTops.frontRight]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[corners.frontLeft, wallTops.frontLeft]}
        color="#6b7280"
        lineWidth={3}
      />
      <Line
        points={[corners.frontRight, wallTops.frontRight]}
        color="#6b7280"
        lineWidth={3}
      />

      {/* Back wall */}
      <Line
        points={[corners.backLeft, corners.backRight]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[wallTops.backLeft, wallTops.backRight]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[corners.backLeft, wallTops.backLeft]}
        color="#6b7280"
        lineWidth={3}
      />
      <Line
        points={[corners.backRight, wallTops.backRight]}
        color="#6b7280"
        lineWidth={3}
      />

      {/* Left wall */}
      <Line
        points={[corners.frontLeft, corners.backLeft]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[wallTops.frontLeft, wallTops.backLeft]}
        color="#6b7280"
        lineWidth={2}
      />

      {/* Right wall */}
      <Line
        points={[corners.frontRight, corners.backRight]}
        color="#6b7280"
        lineWidth={2}
      />
      <Line
        points={[wallTops.frontRight, wallTops.backRight]}
        color="#6b7280"
        lineWidth={2}
      />

      {/* Ridge line */}
      <Line points={[ridgeLeft, ridgeRight]} color="#10b981" lineWidth={4} />

      {/* Front roof rafters */}
      <Line
        points={[wallTops.frontLeft, ridgeLeft]}
        color="#ef4444"
        lineWidth={3}
      />
      <Line
        points={[wallTops.frontRight, ridgeRight]}
        color="#ef4444"
        lineWidth={3}
      />

      {/* Back roof rafters */}
      <Line
        points={[wallTops.backLeft, ridgeLeft]}
        color="#ef4444"
        lineWidth={3}
      />
      <Line
        points={[wallTops.backRight, ridgeRight]}
        color="#ef4444"
        lineWidth={3}
      />

      {/* Gable ends (triangular fill) */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={
              new Float32Array([
                wallTops.frontLeft.x,
                wallTops.frontLeft.y,
                wallTops.frontLeft.z,
                ridgeLeft.x,
                ridgeLeft.y,
                ridgeLeft.z,
                wallTops.backLeft.x,
                wallTops.backLeft.y,
                wallTops.backLeft.z,
              ])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color="#d1d5db"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={
              new Float32Array([
                wallTops.frontRight.x,
                wallTops.frontRight.y,
                wallTops.frontRight.z,
                ridgeRight.x,
                ridgeRight.y,
                ridgeRight.z,
                wallTops.backRight.x,
                wallTops.backRight.y,
                wallTops.backRight.z,
              ])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color="#d1d5db"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Roof surfaces */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={6}
            array={
              new Float32Array([
                wallTops.frontLeft.x,
                wallTops.frontLeft.y,
                wallTops.frontLeft.z,
                ridgeLeft.x,
                ridgeLeft.y,
                ridgeLeft.z,
                ridgeRight.x,
                ridgeRight.y,
                ridgeRight.z,
                wallTops.frontLeft.x,
                wallTops.frontLeft.y,
                wallTops.frontLeft.z,
                ridgeRight.x,
                ridgeRight.y,
                ridgeRight.z,
                wallTops.frontRight.x,
                wallTops.frontRight.y,
                wallTops.frontRight.z,
              ])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={6}
            array={
              new Float32Array([
                wallTops.backLeft.x,
                wallTops.backLeft.y,
                wallTops.backLeft.z,
                ridgeLeft.x,
                ridgeLeft.y,
                ridgeLeft.z,
                ridgeRight.x,
                ridgeRight.y,
                ridgeRight.z,
                wallTops.backLeft.x,
                wallTops.backLeft.y,
                wallTops.backLeft.z,
                ridgeRight.x,
                ridgeRight.y,
                ridgeRight.z,
                wallTops.backRight.x,
                wallTops.backRight.y,
                wallTops.backRight.z,
              ])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ridge height indicator */}
      <Line
        points={[
          new THREE.Vector3(scaledRidgeOffset, 0, 0),
          new THREE.Vector3(scaledRidgeOffset, scaledRidgeHeight, 0),
        ]}
        color="#f59e0b"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.05}
      />
      <Text
        position={[scaledRidgeOffset + 0.3, scaledRidgeHeight / 2, 0]}
        fontSize={0.12}
        color="#f59e0b"
        anchorX="left"
        anchorY="middle"
      >
        {ridge.height.toFixed(1)}
      </Text>

      {/* Wall labels */}
      {walls.map((wall) => {
        let position: THREE.Vector3;
        let labelPosition: "front" | "back" | "left" | "right" = wall.position;

        switch (wall.position) {
          case "front":
            position = new THREE.Vector3(
              -scaledSpan / 2 - 0.3,
              (wall.height * scale) / 2,
              0
            );
            break;
          case "back":
            position = new THREE.Vector3(
              scaledSpan / 2 + 0.3,
              (wall.height * scale) / 2,
              0
            );
            break;
          case "left":
            position = new THREE.Vector3(
              0,
              (wall.height * scale) / 2,
              -scaledWidth / 2 - 0.3
            );
            break;
          case "right":
            position = new THREE.Vector3(
              0,
              (wall.height * scale) / 2,
              scaledWidth / 2 + 0.3
            );
            break;
          default:
            position = new THREE.Vector3(0, 0, 0);
        }

        return (
          <Text
            key={wall.id}
            position={position}
            fontSize={0.1}
            color="#4b5563"
            anchorX="center"
            anchorY="middle"
          >
            {wall.name}: {wall.height.toFixed(1)}
          </Text>
        );
      })}

      {/* Roof side angle labels */}
      {frontRoof && (
        <Text
          position={[
            -scaledSpan / 4 + scaledRidgeOffset / 2,
            (frontHeight + scaledRidgeHeight) / 2,
            0,
          ]}
          fontSize={0.15}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          {frontRoof.angle.toFixed(1)}°
        </Text>
      )}
      {backRoof && (
        <Text
          position={[
            scaledSpan / 4 + scaledRidgeOffset / 2,
            (backHeight + scaledRidgeHeight) / 2,
            0,
          ]}
          fontSize={0.15}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          {backRoof.angle.toFixed(1)}°
        </Text>
      )}
    </group>
  );
};
