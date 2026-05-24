/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-label": ariaLabel,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    "aria-label"?: string;
  }) => React.createElement("a", { href, className, "aria-label": ariaLabel }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/lib/cart/cart-events", () => ({
  CART_CHANGED_EVENT: "cart-changed",
}));

vi.mock("@/lib/cart/pending-storage", () => ({
  getPendingItemCount: vi.fn().mockReturnValue(0),
}));

vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/chat/chat-provider", () => ({
  useChat: vi.fn().mockReturnValue({
    isOpen: false,
    openPanel: vi.fn(),
    unreadFromStore: false,
    hasSession: false,
  }),
}));

import React from "react";
import { StorefrontFabs } from "./storefront-fabs";
import { useChat } from "@/components/chat/chat-provider";

describe("StorefrontFabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("FAB-01-a: renders cart FAB when initialCartCount is 0 (no early return)", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    const cartLink = screen.getByRole("link", { name: "Кошик" });
    expect(cartLink).toBeDefined();
  });

  it("FAB-01-b: cart FAB has href='/koszyk'", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    const cartLink = screen.getByRole("link", { name: "Кошик" });
    expect(cartLink.getAttribute("href")).toBe("/koszyk");
  });

  it("FAB-01-c: does NOT show badge when initialCartCount is 0", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    expect(screen.queryByText("0")).toBeNull();
  });

  it("FAB-01-d: shows badge with '3' when initialCartCount is 3", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={3} hasSession={true} />,
    );
    expect(screen.getByText("3")).toBeDefined();
  });

  it("FAB-01-e: shows badge '9+' when initialCartCount is 10", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={10} hasSession={true} />,
    );
    expect(screen.getByText("9+")).toBeDefined();
  });

  it("FAB-02-a: renders callback FAB button with aria-label='Замовити дзвінок'", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    const callbackBtn = screen.getByRole("button", { name: "Замовити дзвінок" });
    expect(callbackBtn).toBeDefined();
  });

  it("FAB-02-b: clicking callback FAB opens dialog with title 'Зв'яжіться з нами'", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Замовити дзвінок" }));
    expect(screen.getByText("Зв'яжіться з нами")).toBeDefined();
  });

  it("FAB-02-c: dialog shows formatted phone when phones prop is non-empty", () => {
    render(
      <StorefrontFabs
        phones={[{ id: "p1", digits: "0971112233", label: null }]}
        initialCartCount={0}
        hasSession={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Замовити дзвінок" }));
    expect(screen.getByText(/97/)).toBeDefined();
  });

  it("FAB-02-d: dialog contains callback form heading 'Вкажіть свій номер — ми передзвонимо'", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Замовити дзвінок" }));
    expect(
      screen.getByText("Вкажіть свій номер — ми передзвонимо"),
    ).toBeDefined();
  });

  it("FAB-04-a: wrapper div className includes right-6", () => {
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    const callbackBtn = screen.getByRole("button", { name: "Замовити дзвінок" });
    const wrapper = callbackBtn.parentElement;
    expect(wrapper?.className).toContain("right-6");
    expect(wrapper?.className).not.toContain("left-6");
  });

  it("FAB-04-b: chat FAB renders when isOpen is false", () => {
    vi.mocked(useChat).mockReturnValue({
      isOpen: false,
      openPanel: vi.fn(),
      unreadFromStore: false,
      hasSession: false,
    } as ReturnType<typeof useChat>);
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    expect(screen.getByRole("button", { name: "Відкрити чат з магазином" })).toBeDefined();
  });

  it("FAB-04-c: chat FAB is hidden when isOpen is true", () => {
    vi.mocked(useChat).mockReturnValue({
      isOpen: true,
      openPanel: vi.fn(),
      unreadFromStore: false,
      hasSession: false,
    } as ReturnType<typeof useChat>);
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    expect(screen.queryByRole("button", { name: "Відкрити чат з магазином" })).toBeNull();
  });

  it("FAB-04-d: chat FAB has correct aria-label", () => {
    vi.mocked(useChat).mockReturnValue({
      isOpen: false,
      openPanel: vi.fn(),
      unreadFromStore: false,
      hasSession: false,
    } as ReturnType<typeof useChat>);
    render(
      <StorefrontFabs phones={[]} initialCartCount={0} hasSession={false} />,
    );
    expect(screen.getByRole("button", { name: "Відкрити чат з магазином" })).toBeDefined();
  });
});
