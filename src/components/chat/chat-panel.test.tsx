/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// Mock useChat before imports so hoisting works correctly
const mockUseChat = vi.fn();

vi.mock("@/components/chat/chat-provider", () => ({
  useChat: () => mockUseChat(),
}));

vi.mock("@/components/chat/message-list", () => ({
  MessageList: () => null,
}));

vi.mock("@/components/chat/chat-composer", () => ({
  ChatComposer: () => null,
}));

vi.mock("@/components/chat/archived-chat-banner", () => ({
  ArchivedChatBanner: () => null,
}));

vi.mock("@/components/chat/product-context-banner", () => ({
  ProductContextBanner: () => null,
}));

vi.mock("@/components/chat/history-drawer", () => ({
  HistoryDrawer: () => null,
}));

import { ChatPanel } from "@/components/chat/chat-panel";

// Minimal ChatContextValue shape that satisfies all component consumers
const baseChatContext = {
  isOpen: true,
  messages: [],
  isLoading: false,
  loadError: null,
  isDisconnected: false,
  productContext: null,
  conversationStatus: null,
  conversationId: null,
  canSend: true,
  unreadCount: 0,
  guestToken: null,
  hasSession: false,
  closePanel: vi.fn(),
  openPanel: vi.fn(),
  refetchMessages: vi.fn(),
  appendMessage: vi.fn(),
  replaceOptimisticMessage: vi.fn(),
  removeOptimisticMessage: vi.fn(),
  setConversationId: vi.fn(),
  setConversationStatus: vi.fn(),
  clearUnreadCount: vi.fn(),
  resetMessages: vi.fn(),
  updateGuestToken: vi.fn(),
  openHistory: vi.fn(),
  panelView: "thread" as const,
  closeHistory: vi.fn(),
};

describe("PanelHeader — Menu icon visibility gated on hasSession", () => {
  beforeEach(() => {
    // jsdom doesn't implement matchMedia — stub it so useIsMobile doesn't throw
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // treat as desktop so desktop PanelBody is rendered
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("guest user (hasSession=false) does NOT see the history menu icon (CHAT-06)", () => {
    mockUseChat.mockReturnValue({ ...baseChatContext, hasSession: false });

    render(<ChatPanel />);

    expect(
      screen.queryByRole("button", { name: /Відкрити меню чатів/ }),
    ).toBeNull();
  });

  it("authenticated user (hasSession=true) DOES see the history menu icon (CHAT-06)", () => {
    mockUseChat.mockReturnValue({
      ...baseChatContext,
      hasSession: true,
      openHistory: vi.fn(),
    });

    render(<ChatPanel />);

    expect(
      screen.getByRole("button", { name: /Відкрити меню чатів/ }),
    ).toBeTruthy();
  });
});

describe("CHAT-12 — Mobile Drawer", () => {
  beforeEach(() => {
    // Simulate mobile viewport (max-width: 767px matches)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it.fails("renders drawer-popup when isMobile and isOpen", () => {
    mockUseChat.mockReturnValue({ ...baseChatContext, isOpen: true });

    render(<ChatPanel />);

    // Fails now: current implementation renders SheetContent (data-slot="sheet-content"),
    // not a Drawer component with data-slot="drawer-popup".
    // Will pass after Plan 03 replaces Sheet with shadcn Drawer on mobile.
    expect(document.querySelector('[data-slot="drawer-popup"]')).not.toBeNull();
  });
});

describe("CHAT-13 — History overlay always-rendered", () => {
  beforeEach(() => {
    // Desktop viewport so desktop branch is exercised
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it.fails("renders PanelBody even when panelView=history", () => {
    mockUseChat.mockReturnValue({
      ...baseChatContext,
      isOpen: true,
      panelView: "history" as const,
    });

    render(<ChatPanel />);

    // Fails now: chat-panel.tsx line 185 swaps PanelBody out entirely when
    // panelView="history", rendering HistoryDrawer instead. PanelHeader (and its
    // "Чат з магазином" text) is only inside PanelBody, so the text is absent.
    // Will pass after Plan 04 introduces an always-rendered PanelBody with
    // HistoryDrawer as an overlay.
    expect(screen.getByText("Чат з магазином")).toBeTruthy();
  });
});

describe("CHAT-14 — isOpen as pure useState", () => {
  it.todo(
    "closePanel is called on drawer close; no URL manipulation occurs",
  );
});
