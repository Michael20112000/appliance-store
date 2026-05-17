import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const validEnv = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://localhost/db",
  DIRECT_URL: "postgresql://localhost/db",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
  PUSHER_APP_ID: "123456",
  PUSHER_KEY: "pusher-key",
  PUSHER_SECRET: "pusher-secret",
  PUSHER_CLUSTER: "eu",
  NEXT_PUBLIC_PUSHER_KEY: "pusher-key",
  NEXT_PUBLIC_PUSHER_CLUSTER: "eu",
};

describe("parseEnv", () => {
  it("parses valid env", () => {
    expect(parseEnv(validEnv).NEXT_PUBLIC_APP_URL).toBe(
      "http://localhost:3000",
    );
  });

  it("fails when BETTER_AUTH_SECRET is too short", () => {
    expect(() =>
      parseEnv({ ...validEnv, BETTER_AUTH_SECRET: "short" }),
    ).toThrow();
  });
});
