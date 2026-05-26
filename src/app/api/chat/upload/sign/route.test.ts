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
const getCloudinaryConfig = vi.fn(() => ({
  cloudName: "test-cloud",
  apiKey: "test-api-key",
  apiSecret: "test-api-secret",
}));

vi.mock("@/lib/cloudinary", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cloudinary")>();
  return {
    ...actual,
    signUploadParams: (...args: unknown[]) => signUploadParams(...args),
    getCloudinaryConfig: () => getCloudinaryConfig(),
  };
});

function postSign() {
  return POST(
    new Request("http://localhost/api/chat/upload/sign", {
      method: "POST",
    }),
  );
}

describe("POST /api/chat/upload/sign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signUploadParams.mockReturnValue("mock-signature");
    getCloudinaryConfig.mockReturnValue({
      cloudName: "test-cloud",
      apiKey: "test-api-key",
      apiSecret: "test-api-secret",
    });
  });

  it("returns 401 for unauthenticated request (no session)", async () => {
    getSession.mockResolvedValue(null);

    const res = await postSign();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "UNAUTHORIZED" });
    expect(signUploadParams).not.toHaveBeenCalled();
  });

  it("returns 200 with signature fields for buyer session", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await postSign();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      signature: "mock-signature",
      timestamp: expect.any(Number),
      apiKey: "test-api-key",
      cloudName: "test-cloud",
    });
    expect(signUploadParams).toHaveBeenCalledWith({
      timestamp: expect.any(Number),
      upload_preset: "chat-attachments",
    });
  });

  it("returns 200 with signature fields for admin session", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });

    const res = await postSign();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      signature: "mock-signature",
      timestamp: expect.any(Number),
      apiKey: "test-api-key",
      cloudName: "test-cloud",
    });
    expect(signUploadParams).toHaveBeenCalledWith({
      timestamp: expect.any(Number),
      upload_preset: "chat-attachments",
    });
  });

  it("returns 503 when Cloudinary secrets are missing", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    getCloudinaryConfig.mockImplementation(() => {
      throw new CloudinaryNotConfiguredError();
    });

    const res = await postSign();

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "CLOUDINARY_NOT_CONFIGURED",
    });
  });
});
