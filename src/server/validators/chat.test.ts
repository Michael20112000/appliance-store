import { describe, expect, it } from "vitest";
import { sendMessageSchema } from "./chat";

describe("sendMessageSchema", () => {
  it("rejects empty body", () => {
    const result = sendMessageSchema.safeParse({ body: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects body longer than 2000 characters", () => {
    const result = sendMessageSchema.safeParse({ body: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("accepts trimmed body within limit", () => {
    const result = sendMessageSchema.safeParse({
      body: "  Привіт, чи є цей холодильник у наявності?  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe(
        "Привіт, чи є цей холодильник у наявності?",
      );
    }
  });

  it("accepts optional conversationId and productId", () => {
    const result = sendMessageSchema.safeParse({
      body: "Тест",
      conversationId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      productId: "clyyyyyyyyyyyyyyyyyyyyyyyyy",
    });
    expect(result.success).toBe(true);
  });
});
