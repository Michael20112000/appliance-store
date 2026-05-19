import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDebounce } from "./debounce";

describe("createDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not invoke before delay elapses", () => {
    const debounced = createDebounce(500);
    const fn = vi.fn();

    debounced(fn);
    vi.advanceTimersByTime(499);

    expect(fn).not.toHaveBeenCalled();
  });

  it("invokes once after delay", () => {
    const debounced = createDebounce(500);
    const fn = vi.fn();

    debounced(fn);
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets timer on subsequent schedules", () => {
    const debounced = createDebounce(500);
    const fn = vi.fn();

    debounced(fn);
    vi.advanceTimersByTime(400);
    debounced(fn);
    vi.advanceTimersByTime(400);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("flush invokes pending callback immediately", () => {
    const debounced = createDebounce(500);
    const fn = vi.fn();

    debounced(fn);
    debounced.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancel prevents pending invoke", () => {
    const debounced = createDebounce(500);
    const fn = vi.fn();

    debounced(fn);
    debounced.cancel();
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });
});
