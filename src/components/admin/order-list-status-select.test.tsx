/** @vitest-environment jsdom */
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (value: string | null) => void;
    value?: string;
    disabled?: boolean;
  }) => (
    <div>
      <button
        type="button"
        data-testid="select-confirmed"
        onClick={() => onValueChange?.("CONFIRMED")}
      >
        apply confirmed
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    ...props
  }: React.ComponentProps<"button">) => (
    <button type="button" role="combobox" {...props}>
      {children}
    </button>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

import { updateOrderStatusAction } from "@/server/actions/admin/order.actions";
import { toast } from "sonner";

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

  it("shows stock error toast with hint for INSUFFICIENT_STOCK", async () => {
    vi.mocked(updateOrderStatusAction).mockResolvedValue({
      ok: false,
      error: "INSUFFICIENT_STOCK",
    });

    render(
      <OrderListStatusSelect
        orderId="clxxxxxxxxxxxxxxxxxxxxxxxxx"
        status="PENDING"
        deliveryType="PICKUP"
      />,
    );

    fireEvent.click(screen.getByTestId("select-confirmed"));

    await waitFor(() => {
      expect(updateOrderStatusAction).toHaveBeenCalledWith({
        orderId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Недостатньо товару на складі для підтвердження.",
        {
          description:
            "Збільште кількість товару в адмінці або скасуйте замовлення.",
        },
      );
    });
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
