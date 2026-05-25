import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/permissions", () => ({
  requireAdmin: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/server/services/chat.service", () => ({
  archiveConversation: vi.fn().mockResolvedValue(undefined),
  unarchiveConversation: vi.fn().mockResolvedValue(undefined),
  deleteConversation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockTrigger = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/pusher-server", () => ({
  getPusherServer: vi.fn().mockReturnValue({
    trigger: mockTrigger,
  }),
  conversationChannel: vi.fn((id: string) => `private-conversation-${id}`),
  PusherNotConfiguredError: class PusherNotConfiguredError extends Error {
    constructor() {
      super("Pusher not configured");
      this.name = "PusherNotConfiguredError";
    }
  },
}));

import { archiveConversationAction } from "./chat.actions";

describe("archiveConversationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrigger.mockResolvedValue(undefined);
  });

  it("triggers Pusher conversation:closed event after archiving (CHAT-04)", async () => {
    // Use a valid CUID so Zod parse succeeds; test is RED because action doesn't call Pusher yet
    const conversationId = "clh3vjq8e0000qz3e8q8q8q8q";
    await archiveConversationAction(conversationId);

    expect(mockTrigger).toHaveBeenCalledWith(
      `private-conversation-${conversationId}`,
      "conversation:closed",
      { conversationId },
    );
  });
});
