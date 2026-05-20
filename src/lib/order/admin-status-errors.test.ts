import { describe, expect, it, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { showOrderStatusErrorToast } from "./admin-status-errors";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("showOrderStatusErrorToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows stock title and actionable hint for INSUFFICIENT_STOCK", () => {
    showOrderStatusErrorToast("INSUFFICIENT_STOCK");

    expect(toast.error).toHaveBeenCalledWith(
      "Недостатньо товару на складі для підтвердження.",
      {
        description:
          "Збільште кількість товару в адмінці або скасуйте замовлення.",
      },
    );
  });

  it("uses UNKNOWN title for unrecognized codes", () => {
    showOrderStatusErrorToast("SOME_NEW_CODE");

    expect(toast.error).toHaveBeenCalledWith(
      "Не вдалося оновити статус. Спробуйте ще раз.",
    );
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
