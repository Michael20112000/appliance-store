import type { PublicStoreAddress } from "@/server/services/store-settings.service";

function isEmbedMapUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.searchParams.get("output") === "embed") return true;
    if (u.pathname.startsWith("/maps/embed")) return true;
    return false;
  } catch {
    return false;
  }
}

export function addressExternalMapUrl(address: PublicStoreAddress): string {
  if (address.mapUrl && !isEmbedMapUrl(address.mapUrl)) return address.mapUrl;
  if (address.latitude != null && address.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.text)}`;
}

export function addressMapEmbedSrc(
  address: PublicStoreAddress,
): string | null {
  if (address.mapUrl) return address.mapUrl;
  if (address.latitude != null && address.longitude != null) {
    const { latitude, longitude } = address;
    const delta = 0.01;
    const bbox = [
      longitude - delta,
      latitude - delta,
      longitude + delta,
      latitude + delta,
    ].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(address.text)}&output=embed`;
}
