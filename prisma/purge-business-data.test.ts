import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db";
import {
  isProductionPurgeAllowed,
  isPurgeConfirmed,
  purgeBusinessData,
} from "./purge-business-data";

vi.mock("../src/lib/db", () => ({
  prisma: {
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

const DELETE_ORDER = [
  "message",
  "conversation",
  "orderItem",
  "order",
  "cartItem",
  "cart",
  "wishlistItem",
  "productImage",
  "product",
  "category",
] as const;

function createTxMock() {
  const callOrder: string[] = [];
  const tx = Object.fromEntries(
    DELETE_ORDER.map((model) => [
      model,
      {
        deleteMany: vi.fn().mockImplementation(async () => {
          callOrder.push(model);
          return { count: 0 };
        }),
      },
    ]),
  );
  return { tx, callOrder };
}

describe("isPurgeConfirmed", () => {
  it("rejects when confirm env and flag are absent", () => {
    expect(isPurgeConfirmed({}, [])).toBe(false);
  });

  it("accepts CONFIRM_DB_PURGE=yes", () => {
    expect(isPurgeConfirmed({ CONFIRM_DB_PURGE: "yes" }, [])).toBe(true);
  });

  it("accepts --confirm argv", () => {
    expect(isPurgeConfirmed({}, ["node", "script", "--confirm"])).toBe(true);
  });
});

describe("isProductionPurgeAllowed", () => {
  it("allows non-production without ALLOW_PRODUCTION_PURGE", () => {
    expect(isProductionPurgeAllowed({ NODE_ENV: "development" })).toBe(true);
  });

  it("blocks production without ALLOW_PRODUCTION_PURGE", () => {
    expect(isProductionPurgeAllowed({ NODE_ENV: "production" })).toBe(false);
  });

  it("allows production when ALLOW_PRODUCTION_PURGE=yes", () => {
    expect(
      isProductionPurgeAllowed({
        NODE_ENV: "production",
        ALLOW_PRODUCTION_PURGE: "yes",
      }),
    ).toBe(true);
  });
});

describe("purgeBusinessData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes business models in FK-safe order inside one transaction", async () => {
    const { tx, callOrder } = createTxMock();

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) =>
      fn(tx as never),
    );

    const counts = await purgeBusinessData();

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual([...DELETE_ORDER]);
    expect(counts.Message).toBe(0);
    expect(counts.Category).toBe(0);
  });
});
