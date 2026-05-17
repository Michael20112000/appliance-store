import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

export async function requireBuyer(callbackPath = "/koszyk") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    const safe = sanitizeCallbackUrl(callbackPath, "/koszyk");
    redirect(`/uviity?callbackUrl=${encodeURIComponent(safe)}`);
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/uviity");
  }

  return session;
}

/** API routes: JSON 401 instead of redirect (fetch-friendly for CldUploadWidget). */
export async function assertAdminApi(): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return null;
}
