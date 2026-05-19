/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
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
  afterEach(() => {
    cleanup();
  });

  it("stopPropagation on Select trigger click and pointerdown", () => {
    const parentClick = vi.fn();
    const parentPointerDown = vi.fn();

    const { container } = render(
      <div onClick={parentClick} onPointerDown={parentPointerDown}>
        <OrderListStatusSelect
          orderId="clxxxxxxxxxxxxxxxxxxxxxxxxx"
          status="PENDING"
          deliveryType="PICKUP"
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

  it("does not offer OUT_FOR_DELIVERY for CONFIRMED pickup orders", async () => {
    const { baseElement } = render(
      <OrderListStatusSelect
        orderId="clxxxxxxxxxxxxxxxxxxxxxxxxx"
        status="CONFIRMED"
        deliveryType="PICKUP"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const view = within(baseElement);
    expect(
      view.getByText(ORDER_STATUS_LABELS_UA.READY_FOR_PICKUP),
    ).toBeTruthy();
    expect(
      view.queryByText(ORDER_STATUS_LABELS_UA.OUT_FOR_DELIVERY),
    ).toBeNull();
  });
});
