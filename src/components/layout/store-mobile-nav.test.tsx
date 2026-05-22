/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreMobileNav } from "./store-mobile-nav";
import { SOCIAL_LINKS } from "@/lib/social-links";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("StoreMobileNav", () => {
  it("renders category count badges and callback heading", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[
          { slug: "pralki", name: "Пральні машини", productCount: 3 },
          { slug: "holod", name: "Холодильники", productCount: 1 },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    expect(
      screen.getByText("Вкажіть свій номер — ми передзвонимо"),
    ).toBeDefined();
  });

  it("shows guest auth links when session is null", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByRole("link", { name: "Увійти" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Реєстрація" })).toBeDefined();
  });

  it("shows signed-in auth links when session has a user", () => {
    render(
      <StoreMobileNav
        session={{ user: { name: "Test", email: "t@t.com" } }}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByRole("link", { name: "Кабінет" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Вийти" })).toBeDefined();
  });

  it("shows social nav links in the drawer", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByRole("link", { name: "Telegram" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Viber" })).toBeDefined();
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeDefined();
  });

  it("social links have correct href, target, and rel attributes", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    const telegramLink = screen.getByRole("link", { name: "Telegram" });
    const viberLink = screen.getByRole("link", { name: "Viber" });
    const whatsappLink = screen.getByRole("link", { name: "WhatsApp" });

    expect(telegramLink.getAttribute("href")).toBe(SOCIAL_LINKS.telegram);
    expect(telegramLink.getAttribute("target")).toBe("_blank");
    expect(telegramLink.getAttribute("rel")).toContain("noopener");

    expect(viberLink.getAttribute("href")).toBe(SOCIAL_LINKS.viber);
    expect(whatsappLink.getAttribute("href")).toBe(SOCIAL_LINKS.whatsapp);
  });
});
