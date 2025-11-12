export type Units = "imperial" | "metric";

export interface Wall {
  id: string;
  name: string;
  height: number;
  length: number;
  position: "front" | "back" | "left" | "right";
}

export interface RoofSide {
  id: string;
  name: string;
  attachedWallId: string;
  rafterLength: number;
  angle: number;
  horizontalRun: number;
  verticalRise: number;
}

export interface RidgeConfig {
  offset: number; // Offset from center (positive = towards back wall)
  height: number;
}

export interface RoofConfig {
  walls: Wall[];
  roofSides: RoofSide[];
  ridge: RidgeConfig;
  pitchRise: number;
  pitchRun: number;
  units: Units;
  span: number; // Distance between front and back walls
  width: number; // Distance between left and right walls
}

export interface RoofCalculatorResult {
  walls: Wall[];
  roofSides: RoofSide[];
  ridge: RidgeConfig;
  baseRun: number;
  baseRise: number;
  pitchAngle: number;
  pitchRatio: string;
  commonRafterLength: number;
}
