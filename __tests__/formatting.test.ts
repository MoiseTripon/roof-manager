import { formatDimension, formatAngle } from "@/lib/utils/formatting";

describe("formatDimension", () => {
  it("formats numbers correctly for English locale", () => {
    expect(formatDimension(12.345, "en")).toBe("12.35");
    expect(formatDimension(1000.5, "en")).toBe("1,000.50");
    expect(formatDimension(0.123, "en", 3)).toBe("0.123");
  });

  it("formats numbers correctly for Spanish locale", () => {
    expect(formatDimension(12.345, "es")).toBe("12,35");
    expect(formatDimension(1000.5, "es")).toBe("1.000,50");
    expect(formatDimension(0.123, "es", 3)).toBe("0,123");
  });

  it("respects decimal places parameter", () => {
    expect(formatDimension(12.3456789, "en", 0)).toBe("12");
    expect(formatDimension(12.3456789, "en", 1)).toBe("12.3");
    expect(formatDimension(12.3456789, "en", 4)).toBe("12.3457");
  });
});

describe("formatAngle", () => {
  it("formats angles correctly for English locale", () => {
    expect(formatAngle(45.678, "en")).toBe("45.7");
    expect(formatAngle(90, "en")).toBe("90.0");
    expect(formatAngle(26.5651, "en", 2)).toBe("26.57");
  });

  it("formats angles correctly for Spanish locale", () => {
    expect(formatAngle(45.678, "es")).toBe("45,7");
    expect(formatAngle(90, "es")).toBe("90,0");
    expect(formatAngle(26.5651, "es", 2)).toBe("26,57");
  });

  it("respects decimal places parameter", () => {
    expect(formatAngle(33.3333, "en", 0)).toBe("33");
    expect(formatAngle(33.3333, "en", 3)).toBe("33.333");
  });
});
