import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    callbackRequest: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  CALLBACK_ALREADY_ARCHIVED,
  CALLBACK_NOT_CONSULTED,
  CALLBACK_RATE_LIMIT_MAX,
  CallbackRateLimitError,
  archiveCallbackRequest,
  createCallbackRequest,
  listCallbackRequestsAdmin,
  updateCallbackRequestNote,
  updateCallbackRequestStatus,
} from "./callback-request.service";

const activeRow = {
  id: "cb1",
  phone: "0978734712",
  ipAddress: "1.2.3.4",
  createdAt: new Date(),
  status: "PENDING" as const,
  note: null,
  archivedAt: null,
};

describe("createCallbackRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.create).mockResolvedValue({
      id: "cb1",
      phone: "0978734712",
      ipAddress: "1.2.3.4",
      createdAt: new Date(),
      status: "PENDING",
      note: null,
      archivedAt: null,
    });
  });

  it("throws rate limit error when count >= max in window", async () => {
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(
      CALLBACK_RATE_LIMIT_MAX,
    );

    await expect(
      createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" }),
    ).rejects.toBeInstanceOf(CallbackRateLimitError);

    await expect(
      createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" }),
    ).rejects.toThrow("Занадто багато запитів. Спробуйте пізніше.");

    expect(prisma.callbackRequest.create).not.toHaveBeenCalled();
  });

  it("persists when under rate limit", async () => {
    await createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" });
    expect(prisma.callbackRequest.create).toHaveBeenCalledWith({
      data: { phone: "0978734712", ipAddress: "1.2.3.4" },
    });
  });
});

describe("listCallbackRequestsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.callbackRequest.findMany).mockResolvedValue([]);
  });

  it("active view filters archivedAt null", async () => {
    await listCallbackRequestsAdmin({ view: "active" });
    expect(prisma.callbackRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { archivedAt: null },
      }),
    );
  });

  it("archive view filters archivedAt not null", async () => {
    await listCallbackRequestsAdmin({ view: "archive" });
    expect(prisma.callbackRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { archivedAt: { not: null } },
      }),
    );
  });
});

describe("updateCallbackRequestStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates status when row exists and not archived", async () => {
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue(activeRow);
    vi.mocked(prisma.callbackRequest.update).mockResolvedValue({
      ...activeRow,
      status: "CONSULTED",
    });

    await updateCallbackRequestStatus("cb1", "CONSULTED");

    expect(prisma.callbackRequest.update).toHaveBeenCalledWith({
      where: { id: "cb1" },
      data: { status: "CONSULTED" },
    });
  });
});

describe("updateCallbackRequestNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue(activeRow);
    vi.mocked(prisma.callbackRequest.update).mockResolvedValue(activeRow);
  });

  it("stores trimmed note", async () => {
    await updateCallbackRequestNote("cb1", "  hello  ");
    expect(prisma.callbackRequest.update).toHaveBeenCalledWith({
      where: { id: "cb1" },
      data: { note: "hello" },
    });
  });

  it("empty note saves as null", async () => {
    await updateCallbackRequestNote("cb1", "");
    expect(prisma.callbackRequest.update).toHaveBeenCalledWith({
      where: { id: "cb1" },
      data: { note: null },
    });

    vi.clearAllMocks();
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue(activeRow);
    vi.mocked(prisma.callbackRequest.update).mockResolvedValue(activeRow);

    await updateCallbackRequestNote("cb1", "   ");
    expect(prisma.callbackRequest.update).toHaveBeenCalledWith({
      where: { id: "cb1" },
      data: { note: null },
    });
  });
});

describe("archiveCallbackRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when status is not CONSULTED", async () => {
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue(activeRow);

    await expect(archiveCallbackRequest("cb1")).rejects.toThrow(
      CALLBACK_NOT_CONSULTED,
    );
    expect(prisma.callbackRequest.update).not.toHaveBeenCalled();
  });

  it("sets archivedAt when CONSULTED", async () => {
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue({
      ...activeRow,
      status: "CONSULTED",
    });
    vi.mocked(prisma.callbackRequest.update).mockResolvedValue({
      ...activeRow,
      status: "CONSULTED",
      archivedAt: new Date(),
    });

    await archiveCallbackRequest("cb1");

    expect(prisma.callbackRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cb1" },
        data: expect.objectContaining({
          archivedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("rejects when already archived", async () => {
    vi.mocked(prisma.callbackRequest.findUnique).mockResolvedValue({
      ...activeRow,
      status: "CONSULTED",
      archivedAt: new Date(),
    });

    await expect(archiveCallbackRequest("cb1")).rejects.toThrow(
      CALLBACK_ALREADY_ARCHIVED,
    );
    expect(prisma.callbackRequest.update).not.toHaveBeenCalled();
  });
});
