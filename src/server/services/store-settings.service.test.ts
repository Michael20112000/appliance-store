import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    storePhone: { findMany: vi.fn() },
    storeEmail: { findMany: vi.fn() },
    storeAddress: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/db";
import { getPublicStoreContacts } from "./store-settings.service";

describe("getPublicStoreContacts", () => {
  beforeEach(() => {
    vi.mocked(prisma.storePhone.findMany).mockResolvedValue([]);
    vi.mocked(prisma.storeEmail.findMany).mockResolvedValue([]);
    vi.mocked(prisma.storeAddress.findMany).mockResolvedValue([]);
  });

  it("returns empty arrays when DB has no contacts", async () => {
    const result = await getPublicStoreContacts();
    expect(result).toEqual({ phones: [], emails: [], addresses: [] });
    expect(result.phones).not.toContain("незабаром");
  });
});
