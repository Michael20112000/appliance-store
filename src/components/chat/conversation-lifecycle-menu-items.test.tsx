/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  ConversationLifecycleMenuItems,
  type LifecycleMenuItemProps,
} from "./conversation-lifecycle-menu-items";

function StubItem({ children, disabled, variant, onClick }: LifecycleMenuItemProps) {
  return (
    <button
      type="button"
      data-variant={variant}
      data-disabled={disabled ? "true" : "false"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

describe("ConversationLifecycleMenuItems", () => {
  afterEach(() => {
    cleanup();
  });

  it("active + OPEN shows archive and delete", () => {
    render(
      <ConversationLifecycleMenuItems
        Item={StubItem}
        view="active"
        status="OPEN"
        pending={false}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Архівувати" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Повернути з архіву" })).toBeNull();
    expect(screen.getByRole("button", { name: "Видалити назавжди" })).toBeTruthy();
  });

  it("archive + ARCHIVED shows unarchive and delete", () => {
    render(
      <ConversationLifecycleMenuItems
        Item={StubItem}
        view="archive"
        status="ARCHIVED"
        pending={false}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Архівувати" })).toBeNull();
    expect(screen.getByRole("button", { name: "Повернути з архіву" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Видалити назавжди" })).toBeTruthy();
  });

  it("active + ARCHIVED shows delete only", () => {
    render(
      <ConversationLifecycleMenuItems
        Item={StubItem}
        view="active"
        status="ARCHIVED"
        pending={false}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Архівувати" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Повернути з архіву" })).toBeNull();
    expect(screen.getByRole("button", { name: "Видалити назавжди" })).toBeTruthy();
  });

  it("disables items when pending", () => {
    render(
      <ConversationLifecycleMenuItems
        Item={StubItem}
        view="active"
        status="OPEN"
        pending
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button")) {
      expect(button.getAttribute("data-disabled")).toBe("true");
    }
  });
});
