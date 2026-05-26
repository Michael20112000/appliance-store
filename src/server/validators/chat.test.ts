import { describe, expect, it } from "vitest";
import { chatAttachmentSchema, sendMessageSchema } from "./chat";

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

  it("accepts body-only message without attachments (existing behavior preserved)", () => {
    const result = sendMessageSchema.safeParse({ body: "Привіт" });
    expect(result.success).toBe(true);
  });

  it("accepts attachment-only message with empty body", () => {
    const result = sendMessageSchema.safeParse({
      body: "",
      attachments: [
        {
          publicId: "chat/abc123",
          resourceType: "image",
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          filename: "sample.jpg",
          bytes: 1024,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body with no attachments", () => {
    const result = sendMessageSchema.safeParse({ body: "" });
    expect(result.success).toBe(false);
  });

  it("accepts whitespace-only body with attachment", () => {
    const result = sendMessageSchema.safeParse({
      body: "   ",
      attachments: [
        {
          publicId: "chat/abc123",
          resourceType: "image",
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          filename: "sample.jpg",
          bytes: 1024,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("");
    }
  });

  it("rejects attachment with bytes exceeding 10 MB limit", () => {
    const result = sendMessageSchema.safeParse({
      body: "",
      attachments: [
        {
          publicId: "chat/abc123",
          resourceType: "image",
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          filename: "sample.jpg",
          bytes: 10_485_761,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects attachment with invalid resourceType", () => {
    const result = sendMessageSchema.safeParse({
      body: "Hi",
      attachments: [
        {
          publicId: "chat/abc123",
          resourceType: "video",
          url: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
          filename: "sample.mp4",
          bytes: 1024,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 1 attachment", () => {
    const attachment = {
      publicId: "chat/abc123",
      resourceType: "image" as const,
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      filename: "sample.jpg",
      bytes: 1024,
    };
    const result = sendMessageSchema.safeParse({
      body: "Hi",
      attachments: [attachment, attachment],
    });
    expect(result.success).toBe(false);
  });
});

describe("chatAttachmentSchema", () => {
  it("validates a valid image attachment", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "chat/abc123",
      resourceType: "image",
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      filename: "sample.jpg",
      bytes: 1024,
    });
    expect(result.success).toBe(true);
  });

  it("validates a valid raw attachment", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "chat/doc456",
      resourceType: "raw",
      url: "https://res.cloudinary.com/demo/raw/upload/document.pdf",
      filename: "document.pdf",
      bytes: 204800,
    });
    expect(result.success).toBe(true);
  });

  it("rejects bytes > 10 MB", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "chat/abc123",
      resourceType: "image",
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      filename: "sample.jpg",
      bytes: 10_485_761,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid url", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "chat/abc123",
      resourceType: "image",
      url: "not-a-url",
      filename: "sample.jpg",
      bytes: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-Cloudinary url", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "chat/abc123",
      resourceType: "image",
      url: "https://evil.example.com/image.jpg",
      filename: "image.jpg",
      bytes: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects publicId without chat/ prefix", () => {
    const result = chatAttachmentSchema.safeParse({
      publicId: "other/abc123",
      resourceType: "image",
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      filename: "sample.jpg",
      bytes: 1024,
    });
    expect(result.success).toBe(false);
  });
});
