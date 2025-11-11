export type Units = "imperial" | "metric";

export interface RoofCalculatorParams {
  span: number; // in feet or meters
  pitchRise: number; // rise in inches or cm
  pitchRun: number; // run in inches or cm (typically 12 or 100)
  units: Units;
  ridgeOffset?: number; // horizontal offset of ridge from center (positive = right, negative = left)
}

export interface RoofCalculatorResult {
  run: number; // horizontal distance from wall to ridge (center-based)
  rise: number; // vertical distance from wall top to ridge
  commonRafterLength: number; // length of rafter from wall to ridge (when symmetric)
  leftRafterLength: number; // length of left rafter
  rightRafterLength: number; // length of right rafter
  pitchAngle: number; // angle in degrees (base pitch)
  leftAngle: number; // angle of left slope in degrees
  rightAngle: number; // angle of right slope in degrees
  pitchRatio: string; // formatted pitch ratio
}

/**
 * Calculate roof dimensions for a gable roof
 * @param params - Roof parameters including span and pitch
 * @returns Calculated roof dimensions
 */
export function useRoofCalculator(
  params: RoofCalculatorParams
): RoofCalculatorResult {
  const { span, pitchRise, pitchRun, units, ridgeOffset = 0 } = params;

  // Validate inputs
  if (span <= 0) {
    throw new Error("Span must be greater than 0");
  }
  if (pitchRise < 0) {
    throw new Error("Pitch rise must be non-negative");
  }
  if (pitchRun <= 0) {
    throw new Error("Pitch run must be greater than 0");
  }

  // Calculate base run (half of span)
  const baseRun = span / 2;

  // Convert to same units for calculation
  // For imperial: run is in feet, need to convert to inches to match pitch
  // For metric: run is in meters, need to convert to cm to match pitch
  const conversionFactor = units === "imperial" ? 12 : 100;
  const runInSmallUnits = baseRun * conversionFactor;
  const riseInSmallUnits = (runInSmallUnits * pitchRise) / pitchRun;
  const riseInLargeUnits = riseInSmallUnits / conversionFactor;

  // Calculate runs for each side considering ridge offset
  const leftRun = baseRun - ridgeOffset;
  const rightRun = baseRun + ridgeOffset;

  // Calculate rafter lengths using Pythagorean theorem
  const leftRafterLength = Math.sqrt(
    Math.pow(leftRun, 2) + Math.pow(riseInLargeUnits, 2)
  );
  const rightRafterLength = Math.sqrt(
    Math.pow(rightRun, 2) + Math.pow(riseInLargeUnits, 2)
  );
  const commonRafterLength = Math.sqrt(
    Math.pow(baseRun, 2) + Math.pow(riseInLargeUnits, 2)
  );

  // Calculate pitch angles
  const pitchAngle = (Math.atan(pitchRise / pitchRun) * 180) / Math.PI;

  // Calculate individual slope angles based on actual geometry
  const leftAngle = (Math.atan(riseInLargeUnits / leftRun) * 180) / Math.PI;
  const rightAngle = (Math.atan(riseInLargeUnits / rightRun) * 180) / Math.PI;

  // Format pitch ratio
  const pitchRatio = `${pitchRise}/${pitchRun}`;

  return {
    run: baseRun,
    rise: riseInLargeUnits,
    commonRafterLength,
    leftRafterLength,
    rightRafterLength,
    pitchAngle,
    leftAngle,
    rightAngle,
    pitchRatio,
  };
}

/**
 * Format number to fixed decimal places
 */
export function formatDimension(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
