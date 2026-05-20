import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/generated/prisma/client";
import { getOrderStatusAccentClass } from "./status-styles";

const STATUS_HUE: Record<OrderStatus, string> = {
  PENDING: "amber",
  CONFIRMED: "sky",
  READY_FOR_PICKUP: "violet",
  OUT_FOR_DELIVERY: "violet",
  COMPLETED: "emerald",
  CANCELLED: "red",
};

describe("getOrderStatusAccentClass", () => {
  it.each(
    Object.entries(STATUS_HUE) as Array<[OrderStatus, string]>,
  )("returns accent classes for %s", (status, hue) => {
    const classes = getOrderStatusAccentClass(status);
    expect(classes.length).toBeGreaterThan(0);
    expect(classes).toContain(hue);
  });
});
