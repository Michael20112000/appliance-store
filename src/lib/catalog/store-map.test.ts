import { describe, expect, it } from "vitest";
import { addressExternalMapUrl } from "./store-map";

type Addr = Parameters<typeof addressExternalMapUrl>[0];

describe("addressExternalMapUrl", () => {
  it("returns normal mapUrl unchanged", () => {
    const addr = { mapUrl: "https://maps.apple.com/?q=Kyiv", text: "Kyiv" } as Addr;
    expect(addressExternalMapUrl(addr)).toBe("https://maps.apple.com/?q=Kyiv");
  });

  it("falls through embed URL (output=embed) to text search", () => {
    const addr = {
      mapUrl: "https://maps.google.com/maps?q=Kyiv&output=embed",
      text: "Kyiv",
    } as Addr;
    expect(addressExternalMapUrl(addr)).toContain("google.com/maps/search");
    expect(addressExternalMapUrl(addr)).toContain("Kyiv");
  });

  it("falls through /maps/embed path URL to text search", () => {
    const addr = {
      mapUrl: "https://www.google.com/maps/embed?pb=abc123",
      text: "Lviv",
    } as Addr;
    expect(addressExternalMapUrl(addr)).toContain("google.com/maps/search");
  });

  it("uses lat/lng URL when embed URL stored and coords available", () => {
    const addr = {
      mapUrl: "https://maps.google.com/maps?q=test&output=embed",
      latitude: 50.45,
      longitude: 30.52,
      text: "Kyiv",
    } as Addr;
    expect(addressExternalMapUrl(addr)).toBe(
      "https://www.google.com/maps/search/?api=1&query=50.45,30.52",
    );
  });

  it("encodes text when no mapUrl and no coords", () => {
    const addr = { text: "вул. Хрещатик 1, Київ" } as Addr;
    expect(addressExternalMapUrl(addr)).toContain(
      encodeURIComponent("вул. Хрещатик 1, Київ"),
    );
  });
});
