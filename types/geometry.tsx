export interface Vertex {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface PolygonElement {
  id: number;
  name: string;
  vertices: number[]; // vertex IDs
}

export interface ElementGroup {
  contourColor: string;
  elements: PolygonElement[];
}

export interface HouseData {
  vertices: Vertex[];
  walls: ElementGroup;
  roof: ElementGroup;
}

export interface ElementProperties {
  id: number;
  name: string;
  type: "wall" | "roof";
  height: number;
  width: number;
  length?: number;
  angle?: number;
  position: { x: number; y: number; z: number };
  vertices: number[];
}

export interface MeasurementResult {
  span: number;
  width: number;
  maxHeight: number;
  ridgeHeight: number;
  roofPitch: string;
  roofAngle: number;
  wallAreas: { id: number; name: string; area: number }[];
  roofAreas: { id: number; name: string; area: number }[];
  totalWallArea: number;
  totalRoofArea: number;
}
