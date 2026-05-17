export function sanitizeCallbackUrl(
  value: string | string[] | undefined,
  fallback = "/kabinet",
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  if (raw.includes("://")) {
    return fallback;
  }
  return raw;
}
