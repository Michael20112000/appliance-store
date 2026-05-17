import { afterEach, describe, expect, it, vi } from "vitest";
import { getTrustedAuthOrigins, resolveAuthBaseURL } from "./auth-url";

describe("resolveAuthBaseURL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses window origin in the browser", () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost:3001" } });
    expect(resolveAuthBaseURL()).toBe("http://localhost:3001");
  });

  it("uses NEXT_PUBLIC_APP_URL on the server", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000/");
    expect(resolveAuthBaseURL()).toBe("http://localhost:3000");
  });
});

describe("getTrustedAuthOrigins", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes env origins and localhost dev ports", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const origins = getTrustedAuthOrigins();

    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("http://localhost:3001");
  });
});
