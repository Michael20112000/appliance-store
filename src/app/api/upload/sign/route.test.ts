import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { POST } from "./route";

const getSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSession(...args),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

const signUploadParams = vi.fn(() => "mock-signature");

vi.mock("@/lib/cloudinary", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cloudinary")>();
  return {
    ...actual,
    signUploadParams: (...args: unknown[]) => signUploadParams(...args),
  };
});

function postSign(body: unknown) {
  return POST(
    new Request("http://localhost/api/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/upload/sign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signUploadParams.mockReturnValue("mock-signature");
  });

  it("returns 401 for buyer session", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", role: "buyer" },
    });

    const res = await postSign({ paramsToSign: { timestamp: 1 } });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "UNAUTHORIZED" });
    expect(signUploadParams).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValue(null);

    const res = await postSign({ paramsToSign: { timestamp: 1 } });

    expect(res.status).toBe(401);
    expect(signUploadParams).not.toHaveBeenCalled();
  });

  it("returns 200 with signature for admin", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });

    const res = await postSign({ paramsToSign: { timestamp: 1234567890 } });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ signature: "mock-signature" });
    expect(signUploadParams).toHaveBeenCalledWith({ timestamp: 1234567890 });
  });

  it("returns 503 when Cloudinary secrets are missing", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });
    signUploadParams.mockImplementation(() => {
      throw new CloudinaryNotConfiguredError();
    });

    const res = await postSign({ paramsToSign: { timestamp: 1 } });

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "CLOUDINARY_NOT_CONFIGURED",
    });
  });
});
