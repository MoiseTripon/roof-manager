export type Units = "imperial" | "metric";

export interface RoofCalculatorParams {
  span: number;
  pitchRise: number;
  pitchRun: number;
  units: Units;
  ridgeOffset?: number; // positive = towards wall2, negative = towards wall1
  wall1Height?: number; // formerly leftWallHeight
  wall2Height?: number; // formerly rightWallHeight
}

export interface RoofCalculatorResult {
  run: number;
  rise: number;
  ridgeHeight: number;
  commonRafterLength: number;
  wall1RafterLength: number; // formerly leftRafterLength
  wall2RafterLength: number; // formerly rightRafterLength
  pitchAngle: number;
  wall1Angle: number; // formerly leftAngle
  wall2Angle: number; // formerly rightAngle
  pitchRatio: string;
  wall1Run: number; // horizontal distance from wall1 to ridge
  wall2Run: number; // horizontal distance from wall2 to ridge
}

export function useRoofCalculator(
  params: RoofCalculatorParams
): RoofCalculatorResult {
  const {
    span,
    pitchRise,
    pitchRun,
    units,
    ridgeOffset = 0,
    wall1Height = 8,
    wall2Height = 8,
  } = params;

  if (span <= 0) {
    throw new Error("Span must be greater than 0");
  }
  if (pitchRise < 0) {
    throw new Error("Pitch rise must be non-negative");
  }
  if (pitchRun <= 0) {
    throw new Error("Pitch run must be greater than 0");
  }
  if (wall1Height < 0 || wall2Height < 0) {
    throw new Error("Wall heights must be non-negative");
  }

  const baseRun = span / 2;

  const conversionFactor = units === "imperial" ? 12 : 100;
  const runInSmallUnits = baseRun * conversionFactor;
  const riseInSmallUnits = (runInSmallUnits * pitchRise) / pitchRun;
  const riseInLargeUnits = riseInSmallUnits / conversionFactor;

  const avgWallHeight = (wall1Height + wall2Height) / 2;
  const ridgeHeight = avgWallHeight + riseInLargeUnits;

  // FIXED: Correct horizontal runs for each side
  // ridgeOffset positive = ridge moves towards wall2 (right)
  // This means wall1 side gets longer, wall2 side gets shorter
  const wall1Run = baseRun + ridgeOffset;
  const wall2Run = baseRun - ridgeOffset;

  // Calculate actual vertical rise from each wall top to ridge
  const wall1Rise = ridgeHeight - wall1Height;
  const wall2Rise = ridgeHeight - wall2Height;

  // Calculate rafter lengths
  const wall1RafterLength = Math.sqrt(
    Math.pow(wall1Run, 2) + Math.pow(wall1Rise, 2)
  );
  const wall2RafterLength = Math.sqrt(
    Math.pow(wall2Run, 2) + Math.pow(wall2Rise, 2)
  );
  const commonRafterLength = Math.sqrt(
    Math.pow(baseRun, 2) + Math.pow(riseInLargeUnits, 2)
  );

  const pitchAngle = (Math.atan(pitchRise / pitchRun) * 180) / Math.PI;

  // Calculate actual slope angles
  const wall1Angle =
    wall1Run > 0 ? (Math.atan(wall1Rise / wall1Run) * 180) / Math.PI : 90;
  const wall2Angle =
    wall2Run > 0 ? (Math.atan(wall2Rise / wall2Run) * 180) / Math.PI : 90;

  const pitchRatio = `${pitchRise}/${pitchRun}`;

  return {
    run: baseRun,
    rise: riseInLargeUnits,
    ridgeHeight,
    commonRafterLength,
    wall1RafterLength,
    wall2RafterLength,
    pitchAngle,
    wall1Angle,
    wall2Angle,
    pitchRatio,
    wall1Run,
    wall2Run,
  };
}

export function formatDimension(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
