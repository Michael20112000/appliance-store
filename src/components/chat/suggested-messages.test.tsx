/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { SuggestedMessages } from "@/components/chat/suggested-messages";

const productContext = {
  productTitle: "Пральна машина LG",
  productId: "prod-1",
  productSlug: "pralna-mashyna-lg",
};

describe("SuggestedMessages", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders product chip when productContext.productTitle is set", () => {
    render(
      <SuggestedMessages productContext={productContext} onSelect={vi.fn()} />,
    );
    const chip = screen.getAllByRole("button").find((btn) =>
      btn.textContent?.includes("Пральна машина LG"),
    );
    expect(chip).toBeDefined();
  });

  it("renders exactly 3 general chips when productContext is null", () => {
    render(<SuggestedMessages productContext={null} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons.map((b) => b.textContent)).toContain("Який у вас графік роботи?");
    expect(buttons.map((b) => b.textContent)).toContain("Де ви знаходитесь?");
    expect(buttons.map((b) => b.textContent)).toContain("Як оформити замовлення?");
  });

  it("renders 4 chips total when productContext.productTitle is set", () => {
    render(
      <SuggestedMessages productContext={productContext} onSelect={vi.fn()} />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("calls onSelect with the chip text string when a chip button is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestedMessages productContext={null} onSelect={onSelect} />);
    const firstChip = screen.getByRole("button", { name: "Який у вас графік роботи?" });
    fireEvent.click(firstChip);
    expect(onSelect).toHaveBeenCalledWith("Який у вас графік роботи?");
  });

  it("does not render product chip when productContext.productTitle is undefined", () => {
    render(
      <SuggestedMessages
        productContext={{ productTitle: undefined as unknown as string, productId: "prod-1", productSlug: "slug" }}
        onSelect={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });
});
