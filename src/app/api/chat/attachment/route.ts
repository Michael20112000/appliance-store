import { headers } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { CloudinaryNotConfiguredError, getCloudinaryConfig } from "@/lib/cloudinary";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const publicId = new URL(request.url).searchParams.get("publicId");
  if (!publicId?.startsWith("chat/")) {
    return Response.json({ error: "INVALID_PUBLIC_ID" }, { status: 400 });
  }

  try {
    getCloudinaryConfig();
  } catch (err) {
    if (err instanceof CloudinaryNotConfiguredError) {
      return Response.json({ error: "CLOUDINARY_NOT_CONFIGURED" }, { status: 503 });
    }
    throw err;
  }

  const expiresAt = Math.round(Date.now() / 1000) + 300;
  const downloadUrl = cloudinary.utils.private_download_url(publicId, "", {
    resource_type: "raw",
    expires_at: expiresAt,
    attachment: true,
  });

  return Response.redirect(downloadUrl, 302);
}
