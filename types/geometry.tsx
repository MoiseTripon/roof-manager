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

export interface MeasurementResult {
  span: number;
  width: number;
  maxHeight: number;
  roofPitch: number;
  roofAngle: number;
  wallAreas: { id: number; name: string; area: number }[];
  roofAreas: { id: number; name: string; area: number }[];
}
