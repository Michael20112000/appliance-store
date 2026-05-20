import { describe, expect, it } from "vitest";
import {
  archiveCallbackSchema,
  callbackListViewSchema,
  listCallbacksAdminPageSchema,
  updateCallbackNoteSchema,
  updateCallbackStatusSchema,
} from "./admin-callback";

describe("updateCallbackStatusSchema", () => {
  it("accepts PENDING and CONSULTED", () => {
    expect(
      updateCallbackStatusSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "PENDING",
      }).success,
    ).toBe(true);
    expect(
      updateCallbackStatusSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONSULTED",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid status string", () => {
    expect(
      updateCallbackStatusSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "DONE",
      }).success,
    ).toBe(false);
  });
});

describe("updateCallbackNoteSchema", () => {
  it("accepts note under 4000 chars", () => {
    expect(
      updateCallbackNoteSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        note: "a".repeat(4000),
      }).success,
    ).toBe(true);
  });

  it("rejects note over 4000", () => {
    expect(
      updateCallbackNoteSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        note: "a".repeat(4001),
      }).success,
    ).toBe(false);
  });

  it("accepts omitted note", () => {
    expect(
      updateCallbackNoteSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      }).success,
    ).toBe(true);
  });
});

describe("callbackListViewSchema", () => {
  it('accepts "active" and "archive"', () => {
    expect(callbackListViewSchema.parse("active")).toBe("active");
    expect(callbackListViewSchema.parse("archive")).toBe("archive");
  });
});

describe("listCallbacksAdminPageSchema", () => {
  it('defaults view to "active"', () => {
    expect(listCallbacksAdminPageSchema.parse({}).view).toBe("active");
  });

  it('accepts view "archive"', () => {
    expect(listCallbacksAdminPageSchema.parse({ view: "archive" }).view).toBe(
      "archive",
    );
  });
});

describe("archiveCallbackSchema", () => {
  it("requires valid cuid id", () => {
    expect(
      archiveCallbackSchema.safeParse({ id: "not-a-cuid" }).success,
    ).toBe(false);
    expect(
      archiveCallbackSchema.safeParse({
        id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      }).success,
    ).toBe(true);
  });
});
