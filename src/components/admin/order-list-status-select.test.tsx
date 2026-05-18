/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { OrderListStatusSelect } from "./order-list-status-select";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/server/actions/admin/order.actions", () => ({
  updateOrderStatusAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("OrderListStatusSelect", () => {
  it("stopPropagation on Select trigger click and pointerdown", () => {
    const parentClick = vi.fn();
    const parentPointerDown = vi.fn();

    const { container } = render(
      <div onClick={parentClick} onPointerDown={parentPointerDown}>
        <OrderListStatusSelect
          orderId="clxxxxxxxxxxxxxxxxxxxxxxxxx"
          status="PENDING"
        />
      </div>,
    );

    const trigger = container.querySelector('[role="combobox"]');
    expect(trigger).toBeTruthy();

    fireEvent.click(trigger!);
    fireEvent.pointerDown(trigger!);

    expect(parentClick).not.toHaveBeenCalled();
    expect(parentPointerDown).not.toHaveBeenCalled();
  });
});
