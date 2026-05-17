import { assertAdminApi } from "@/lib/permissions";
import {
  CloudinaryNotConfiguredError,
  signUploadParams,
} from "@/lib/cloudinary";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const paramsToSign = (body as { paramsToSign?: unknown })?.paramsToSign;
  if (
    paramsToSign === null ||
    typeof paramsToSign !== "object" ||
    Array.isArray(paramsToSign)
  ) {
    return Response.json({ error: "INVALID_PARAMS" }, { status: 400 });
  }

  try {
    const signature = signUploadParams(
      paramsToSign as Record<string, string | number>,
    );
    return Response.json({ signature });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return Response.json(
        { error: "CLOUDINARY_NOT_CONFIGURED" },
        { status: 503 },
      );
    }
    throw error;
  }
}
