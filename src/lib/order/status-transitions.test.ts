import { describe, expect, it } from "vitest";
import type { DeliveryType, OrderStatus } from "@/generated/prisma/client";
import {
  assertTransitionAllowedForDelivery,
  getAllowedNextStatusesForDelivery,
  INVALID_STATUS_TRANSITION,
} from "./status-transitions";

describe("getAllowedNextStatusesForDelivery", () => {
  it.each([
    {
      deliveryType: "PICKUP" as DeliveryType,
      from: "CONFIRMED" as OrderStatus,
      includes: ["READY_FOR_PICKUP"],
      excludes: ["OUT_FOR_DELIVERY"],
    },
    {
      deliveryType: "LVIV_DELIVERY" as DeliveryType,
      from: "CONFIRMED" as OrderStatus,
      includes: ["OUT_FOR_DELIVERY"],
      excludes: ["READY_FOR_PICKUP"],
    },
    {
      deliveryType: "PICKUP" as DeliveryType,
      from: "PENDING" as OrderStatus,
      includes: ["CONFIRMED"],
      excludes: [] as OrderStatus[],
    },
  ])(
    "$deliveryType from $from filters delivery-incompatible targets",
    ({ deliveryType, from, includes, excludes }) => {
      const allowed = getAllowedNextStatusesForDelivery(from, deliveryType);
      for (const status of includes) {
        expect(allowed).toContain(status);
      }
      for (const status of excludes) {
        expect(allowed).not.toContain(status);
      }
    },
  );

  it("returns no transitions from terminal statuses", () => {
    expect(getAllowedNextStatusesForDelivery("COMPLETED", "PICKUP")).toEqual([]);
    expect(getAllowedNextStatusesForDelivery("CANCELLED", "LVIV_DELIVERY")).toEqual(
      [],
    );
  });
});

describe("assertTransitionAllowedForDelivery", () => {
  it.each([
    ["PICKUP", "CONFIRMED", "READY_FOR_PICKUP"],
    ["LVIV_DELIVERY", "CONFIRMED", "OUT_FOR_DELIVERY"],
    ["PICKUP", "PENDING", "CONFIRMED"],
    ["LVIV_DELIVERY", "PENDING", "CONFIRMED"],
  ] as const)(
    "allows %s %s → %s",
    (deliveryType, from, to) => {
      expect(() =>
        assertTransitionAllowedForDelivery(from, to, deliveryType),
      ).not.toThrow();
    },
  );

  it.each([
    ["PICKUP", "CONFIRMED", "OUT_FOR_DELIVERY"],
    ["LVIV_DELIVERY", "CONFIRMED", "READY_FOR_PICKUP"],
    ["PICKUP", "COMPLETED", "CANCELLED"],
  ] as const)(
    "rejects %s %s → %s",
    (deliveryType, from, to) => {
      expect(() =>
        assertTransitionAllowedForDelivery(from, to, deliveryType),
      ).toThrow(INVALID_STATUS_TRANSITION);
    },
  );
});
