import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "@/lib/env";

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super(
      "CLOUDINARY_API_KEY та CLOUDINARY_API_SECRET обовʼязкові для підпису завантажень адміном",
    );
    this.name = "CloudinaryNotConfiguredError";
  }
}

let configured = false;

export function getCloudinaryConfig() {
  const env = getEnv();
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new CloudinaryNotConfiguredError();
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    configured = true;
  }

  return {
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey,
    apiSecret,
  };
}

export function signUploadParams(
  paramsToSign: Record<string, string | number>,
): string {
  const { apiSecret } = getCloudinaryConfig();
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}
