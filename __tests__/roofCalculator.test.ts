import { useRoofCalculator, RoofCalculatorParams } from "@/lib/roofCalculator";

describe("useRoofCalculator", () => {
  describe("Imperial Units", () => {
    it("should calculate correct dimensions for a 24ft span with 6/12 pitch", () => {
      const params: RoofCalculatorParams = {
        span: 24,
        pitchRise: 6,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(12); // half of span
      expect(result.rise).toBe(6); // 12 * 6/12
      expect(result.commonRafterLength).toBeCloseTo(13.416, 2);
      expect(result.pitchAngle).toBeCloseTo(26.565, 2);
      expect(result.pitchRatio).toBe("6/12");
    });

    it("should calculate correct dimensions for a 30ft span with 8/12 pitch", () => {
      const params: RoofCalculatorParams = {
        span: 30,
        pitchRise: 8,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(15);
      expect(result.rise).toBe(10); // 15 * 8/12
      expect(result.commonRafterLength).toBeCloseTo(18.028, 2);
      expect(result.pitchAngle).toBeCloseTo(33.69, 2);
    });

    it("should handle 12/12 pitch (45 degree angle)", () => {
      const params: RoofCalculatorParams = {
        span: 20,
        pitchRise: 12,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(10);
      expect(result.rise).toBe(10);
      expect(result.commonRafterLength).toBeCloseTo(14.142, 2);
      expect(result.pitchAngle).toBeCloseTo(45, 2);
    });

    it("should handle flat roof (0/12 pitch)", () => {
      const params: RoofCalculatorParams = {
        span: 20,
        pitchRise: 0,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(10);
      expect(result.rise).toBe(0);
      expect(result.commonRafterLength).toBe(10);
      expect(result.pitchAngle).toBe(0);
    });
  });

  describe("Metric Units", () => {
    it("should calculate correct dimensions for a 7.32m span with 50/100 pitch", () => {
      const params: RoofCalculatorParams = {
        span: 7.32,
        pitchRise: 50,
        pitchRun: 100,
        units: "metric",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(3.66);
      expect(result.rise).toBeCloseTo(1.83, 2);
      expect(result.commonRafterLength).toBeCloseTo(4.094, 2);
      expect(result.pitchAngle).toBeCloseTo(26.565, 2);
    });

    it("should calculate correct dimensions for 10m span with 100/100 pitch", () => {
      const params: RoofCalculatorParams = {
        span: 10,
        pitchRise: 100,
        pitchRun: 100,
        units: "metric",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(5);
      expect(result.rise).toBe(5);
      expect(result.commonRafterLength).toBeCloseTo(7.071, 2);
      expect(result.pitchAngle).toBeCloseTo(45, 2);
    });
  });

  describe("Input Validation", () => {
    it("should throw error for zero span", () => {
      const params: RoofCalculatorParams = {
        span: 0,
        pitchRise: 6,
        pitchRun: 12,
        units: "imperial",
      };

      expect(() => useRoofCalculator(params)).toThrow(
        "Span must be greater than 0"
      );
    });

    it("should throw error for negative span", () => {
      const params: RoofCalculatorParams = {
        span: -10,
        pitchRise: 6,
        pitchRun: 12,
        units: "imperial",
      };

      expect(() => useRoofCalculator(params)).toThrow(
        "Span must be greater than 0"
      );
    });

    it("should throw error for negative pitch rise", () => {
      const params: RoofCalculatorParams = {
        span: 20,
        pitchRise: -6,
        pitchRun: 12,
        units: "imperial",
      };

      expect(() => useRoofCalculator(params)).toThrow(
        "Pitch rise must be non-negative"
      );
    });

    it("should throw error for zero pitch run", () => {
      const params: RoofCalculatorParams = {
        span: 20,
        pitchRise: 6,
        pitchRun: 0,
        units: "imperial",
      };

      expect(() => useRoofCalculator(params)).toThrow(
        "Pitch run must be greater than 0"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle very steep pitch (24/12)", () => {
      const params: RoofCalculatorParams = {
        span: 20,
        pitchRise: 24,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(10);
      expect(result.rise).toBe(20);
      expect(result.commonRafterLength).toBeCloseTo(22.361, 2);
      expect(result.pitchAngle).toBeCloseTo(63.435, 2);
    });

    it("should handle very shallow pitch (1/12)", () => {
      const params: RoofCalculatorParams = {
        span: 24,
        pitchRise: 1,
        pitchRun: 12,
        units: "imperial",
      };

      const result = useRoofCalculator(params);

      expect(result.run).toBe(12);
      expect(result.rise).toBe(1);
      expect(result.commonRafterLength).toBeCloseTo(12.042, 2);
      expect(result.pitchAngle).toBeCloseTo(4.764, 2);
    });
  });
});
