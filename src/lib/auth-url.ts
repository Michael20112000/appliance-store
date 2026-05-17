const DEV_PORTS = [3000, 3001, 3002, 3003] as const;

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

/** Client: current page origin. SSR: env fallback. */
export function resolveAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  return fromEnv ? normalizeOrigin(fromEnv) : "";
}

/** Origins allowed for Better Auth (cookies / CORS in dev). */
export function getTrustedAuthOrigins(): string[] {
  const origins = new Set<string>();

  for (const value of [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (value) origins.add(normalizeOrigin(value));
  }

  if (process.env.NODE_ENV === "development") {
    for (const port of DEV_PORTS) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
  }

  return [...origins];
}
