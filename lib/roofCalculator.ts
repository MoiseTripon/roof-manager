import {
  Units,
  Wall,
  RoofSide,
  RoofConfig,
  RoofCalculatorResult,
} from "@/types/roof";

export type { Units };

export interface RoofCalculatorParams {
  walls: Wall[];
  pitchRise: number;
  pitchRun: number;
  units: Units;
  ridgeOffset?: number;
}

export function useRoofCalculator(
  params: RoofCalculatorParams
): RoofCalculatorResult {
  const { walls, pitchRise, pitchRun, units, ridgeOffset = 0 } = params;

  // Find front and back walls for gable roof calculation
  const frontWall = walls.find((w) => w.position === "front");
  const backWall = walls.find((w) => w.position === "back");

  if (!frontWall || !backWall) {
    throw new Error("Gable roof requires front and back walls");
  }

  // Calculate span (distance between front and back walls)
  const span = frontWall.length; // Assuming rectangular building

  if (span <= 0) {
    throw new Error("Span must be greater than 0");
  }
  if (pitchRise < 0) {
    throw new Error("Pitch rise must be non-negative");
  }
  if (pitchRun <= 0) {
    throw new Error("Pitch run must be greater than 0");
  }

  const baseRun = span / 2;

  // Convert to same units for calculation
  const conversionFactor = units === "imperial" ? 12 : 100;
  const runInSmallUnits = baseRun * conversionFactor;
  const riseInSmallUnits = (runInSmallUnits * pitchRise) / pitchRun;
  const riseInLargeUnits = riseInSmallUnits / conversionFactor;

  // Calculate average wall height for ridge
  const avgWallHeight = (frontWall.height + backWall.height) / 2;
  const ridgeHeight = avgWallHeight + riseInLargeUnits;

  // Calculate roof sides
  const roofSides: RoofSide[] = [];

  // Front roof side
  const frontRun = baseRun + ridgeOffset;
  const frontRise = ridgeHeight - frontWall.height;
  const frontRafterLength = Math.sqrt(
    Math.pow(frontRun, 2) + Math.pow(frontRise, 2)
  );
  const frontAngle =
    frontRun > 0 ? (Math.atan(frontRise / frontRun) * 180) / Math.PI : 90;

  roofSides.push({
    id: "front-roof",
    name: `${frontWall.name} Roof Side`,
    attachedWallId: frontWall.id,
    rafterLength: frontRafterLength,
    angle: frontAngle,
    horizontalRun: frontRun,
    verticalRise: frontRise,
  });

  // Back roof side
  const backRun = baseRun - ridgeOffset;
  const backRise = ridgeHeight - backWall.height;
  const backRafterLength = Math.sqrt(
    Math.pow(backRun, 2) + Math.pow(backRise, 2)
  );
  const backAngle =
    backRun > 0 ? (Math.atan(backRise / backRun) * 180) / Math.PI : 90;

  roofSides.push({
    id: "back-roof",
    name: `${backWall.name} Roof Side`,
    attachedWallId: backWall.id,
    rafterLength: backRafterLength,
    angle: backAngle,
    horizontalRun: backRun,
    verticalRise: backRise,
  });

  const pitchAngle = (Math.atan(pitchRise / pitchRun) * 180) / Math.PI;
  const pitchRatio = `${pitchRise}/${pitchRun}`;
  const commonRafterLength = Math.sqrt(
    Math.pow(baseRun, 2) + Math.pow(riseInLargeUnits, 2)
  );

  return {
    walls,
    roofSides,
    ridge: {
      offset: ridgeOffset,
      height: ridgeHeight,
    },
    baseRun,
    baseRise: riseInLargeUnits,
    pitchAngle,
    pitchRatio,
    commonRafterLength,
  };
}

export function formatDimension(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
