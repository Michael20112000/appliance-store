/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ProductSearchInput } from "./product-search-input";

let mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe("ProductSearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReplace = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders input with placeholder (ADM-SRCH-01)", () => {
    render(<ProductSearchInput pageSize={20} />);
    expect(screen.getByPlaceholderText("Назва або бренд…")).toBeTruthy();
  });

  it("debounces router.replace with q param after typing (ADM-SRCH-01)", () => {
    render(<ProductSearchInput pageSize={20} />);
    const input = screen.getByPlaceholderText("Назва або бренд…");
    fireEvent.change(input, { target: { value: "Samsung" } });
    vi.advanceTimersByTime(300);
    expect(mockReplace).toHaveBeenCalled();
    const url: string = mockReplace.mock.calls[0][0];
    expect(url).toContain("q=Samsung");
    expect(url).toContain("page=1");
  });

  it("clears q when input is emptied (ADM-SRCH-01)", () => {
    render(<ProductSearchInput pageSize={20} />);
    const input = screen.getByPlaceholderText("Назва або бренд…");
    fireEvent.change(input, { target: { value: "Samsung" } });
    vi.advanceTimersByTime(300);
    fireEvent.change(input, { target: { value: "" } });
    vi.advanceTimersByTime(300);
    const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
    const url: string = lastCall[0];
    expect(url).not.toContain("q=");
  });

  it("resets page to 1 when a new query is typed (ADM-SRCH-01)", () => {
    render(<ProductSearchInput q="Sony" pageSize={20} />);
    const input = screen.getByPlaceholderText("Назва або бренд…");
    fireEvent.change(input, { target: { value: "SonyNew" } });
    vi.advanceTimersByTime(300);
    expect(mockReplace).toHaveBeenCalled();
    const url: string = mockReplace.mock.calls[0][0];
    expect(url).toContain("page=1");
  });

  it("does not navigate on mount (no first-render router.replace) (ADM-SRCH-01)", () => {
    render(<ProductSearchInput q="Samsung" pageSize={20} />);
    vi.advanceTimersByTime(300);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("syncs input value when q prop changes (ADM-SRCH-01)", () => {
    const { rerender } = render(<ProductSearchInput q="Sony" pageSize={20} />);
    rerender(<ProductSearchInput q="LG" pageSize={20} />);
    const input = screen.getByPlaceholderText("Назва або бренд…") as HTMLInputElement;
    expect(input.value).toBe("LG");
  });
});
