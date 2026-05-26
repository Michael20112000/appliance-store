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

  // private_download_url only works for type:"authenticated" resources.
  // Our assets are type:"upload" but require signed delivery (account security setting).
  // cloudinary.url with sign_url:true generates a signed CDN delivery URL that satisfies this.
  const signedUrl = cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    sign_url: true,
    secure: true,
  });

  return Response.redirect(signedUrl, 302);
}
