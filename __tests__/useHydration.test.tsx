import { renderHook } from "@testing-library/react";
import { useHydration } from "@/lib/hooks/useHydration";
import { act } from "react";

describe("useHydration", () => {
  it("returns false initially", () => {
    const { result } = renderHook(() => useHydration());
    expect(result.current).toBe(false);
  });

  it("returns true after mounting", async () => {
    const { result, rerender } = renderHook(() => useHydration());

    // Initially false
    expect(result.current).toBe(false);

    // Wait for effect to run
    await act(async () => {
      rerender();
    });

    // Should be true after mount
    expect(result.current).toBe(true);
  });

  it("remains true on subsequent renders", async () => {
    const { result, rerender } = renderHook(() => useHydration());

    // Wait for mount
    await act(async () => {
      rerender();
    });

    expect(result.current).toBe(true);

    // Rerender multiple times
    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });
});
