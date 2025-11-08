export type Units = "imperial" | "metric";

export interface RoofCalculatorParams {
  span: number; // in feet or meters
  pitchRise: number; // rise in inches or cm
  pitchRun: number; // run in inches or cm (typically 12 or 100)
  units: Units;
}

export interface RoofCalculatorResult {
  run: number; // horizontal distance from wall to ridge
  rise: number; // vertical distance from wall top to ridge
  commonRafterLength: number; // length of rafter from wall to ridge
  pitchAngle: number; // angle in degrees
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
  const { span, pitchRise, pitchRun, units } = params;

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

  // Calculate run (half of span)
  const run = span / 2;

  // Calculate rise based on pitch
  // pitch is expressed as rise/run (e.g., 6/12 means 6 inches of rise per 12 inches of run)
  const rise = (run * pitchRise) / pitchRun;

  // Convert to same units for calculation
  // For imperial: run is in feet, need to convert to inches to match pitch
  // For metric: run is in meters, need to convert to cm to match pitch
  const conversionFactor = units === "imperial" ? 12 : 100;
  const runInSmallUnits = run * conversionFactor;
  const riseInSmallUnits = (runInSmallUnits * pitchRise) / pitchRun;
  const riseInLargeUnits = riseInSmallUnits / conversionFactor;

  // Calculate common rafter length using Pythagorean theorem
  const commonRafterLength = Math.sqrt(
    Math.pow(run, 2) + Math.pow(riseInLargeUnits, 2)
  );

  // Calculate pitch angle in degrees
  const pitchAngle = (Math.atan(pitchRise / pitchRun) * 180) / Math.PI;

  // Format pitch ratio
  const pitchRatio = `${pitchRise}/${pitchRun}`;

  return {
    run,
    rise: riseInLargeUnits,
    commonRafterLength,
    pitchAngle,
    pitchRatio,
  };
}

/**
 * Format number to fixed decimal places
 */
export function formatDimension(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
