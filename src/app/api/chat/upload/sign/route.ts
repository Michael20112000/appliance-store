import { assertBuyerApi } from "@/lib/permissions";
import {
  CloudinaryNotConfiguredError,
  getCloudinaryConfig,
  signUploadParams,
} from "@/lib/cloudinary";

export async function POST(_request: Request) {
  const unauthorized = await assertBuyerApi();
  if (unauthorized) {
    return unauthorized;
  }

  const timestamp = Math.round(Date.now() / 1000);

  let config: ReturnType<typeof getCloudinaryConfig>;
  try {
    config = getCloudinaryConfig();
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return Response.json(
        { error: "CLOUDINARY_NOT_CONFIGURED" },
        { status: 503 },
      );
    }
    throw error;
  }

  const signature = signUploadParams({
    timestamp,
    upload_preset: "chat-attachments",
  });

  return Response.json({
    signature,
    timestamp,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
  });
}
