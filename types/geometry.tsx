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
