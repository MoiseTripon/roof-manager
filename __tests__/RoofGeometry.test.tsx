import React from "react";
import { render, screen } from "@testing-library/react";
import { RoofGeometry } from "@/components/RoofGeometry";
import "@testing-library/jest-dom";

beforeAll(() => {
  const originalError = console.error;
  jest.spyOn(console, "error").mockImplementation((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("is unrecognized in this browser")
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Mock @react-three/drei
jest.mock("@react-three/drei", () => ({
  Line: ({ points, color, "data-testid": testId }: any) => (
    <div data-testid={testId} data-color={color}>
      Line Component
    </div>
  ),
}));

// Mock THREE
jest.mock("three", () => ({
  Vector3: class {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  },
}));

describe("RoofGeometry", () => {
  it("renders all roof components", () => {
    render(<RoofGeometry run={12} rise={6} span={24} />);

    expect(screen.getByTestId("left-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("right-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("span-line")).toBeInTheDocument();
    expect(screen.getByTestId("left-wall")).toBeInTheDocument();
    expect(screen.getByTestId("right-wall")).toBeInTheDocument();
    expect(screen.getByTestId("ridge-line")).toBeInTheDocument();
    expect(screen.getByTestId("ground-line")).toBeInTheDocument();
  });

  it("receives and uses props correctly", () => {
    const { rerender } = render(<RoofGeometry run={10} rise={5} span={20} />);

    // Check that components are rendered
    expect(screen.getByTestId("left-rafter")).toBeInTheDocument();

    // Rerender with different props
    rerender(<RoofGeometry run={15} rise={7.5} span={30} />);

    // Components should still be rendered
    expect(screen.getByTestId("left-rafter")).toBeInTheDocument();
  });

  it("renders with zero rise (flat roof)", () => {
    render(<RoofGeometry run={12} rise={0} span={24} />);

    expect(screen.getByTestId("left-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("right-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("span-line")).toBeInTheDocument();
  });

  it("renders with steep pitch", () => {
    render(<RoofGeometry run={10} rise={20} span={20} />);

    expect(screen.getByTestId("left-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("right-rafter")).toBeInTheDocument();
    expect(screen.getByTestId("ridge-line")).toBeInTheDocument();
  });
});
