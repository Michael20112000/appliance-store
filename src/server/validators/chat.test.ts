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

  it("accepts optional guestToken as UUID", () => {
    const result = sendMessageSchema.safeParse({
      body: "Привіт",
      guestToken: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects guestToken that is not a UUID", () => {
    const result = sendMessageSchema.safeParse({
      body: "Привіт",
      guestToken: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});
