import { describe, expect, it, vi } from "vitest";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "./clickable-table-row";

describe("getAdminClickableRowProps", () => {
  const href = "/admin/tovary/test-id";
  const onNavigate = vi.fn();

  it("returns role link and tabIndex 0", () => {
    const props = getAdminClickableRowProps({ href, onNavigate });
    expect(props.role).toBe("link");
    expect(props.tabIndex).toBe(0);
  });

  it("onClick invokes onNavigate with href", () => {
    const props = getAdminClickableRowProps({ href, onNavigate });
    props.onClick();
    expect(onNavigate).toHaveBeenCalledWith(href);
  });

  it("onKeyDown Enter invokes onNavigate with href", () => {
    const props = getAdminClickableRowProps({ href, onNavigate });
    const event = {
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    props.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith(href);
  });

  it("onKeyDown Space calls preventDefault and onNavigate", () => {
    onNavigate.mockClear();
    const props = getAdminClickableRowProps({ href, onNavigate });
    const event = {
      key: " ",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    props.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith(href);
  });

  it("onKeyDown other keys do not call onNavigate", () => {
    onNavigate.mockClear();
    const props = getAdminClickableRowProps({ href, onNavigate });
    const event = {
      key: "Tab",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    props.onKeyDown(event);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});

describe("adminClickableRowClassName", () => {
  it("includes D-11-08 hover and focus tokens", () => {
    expect(adminClickableRowClassName).toContain("cursor-pointer");
    expect(adminClickableRowClassName).toContain("hover:bg-muted/40");
    expect(adminClickableRowClassName).toContain("focus-visible:bg-muted/40");
  });
});
