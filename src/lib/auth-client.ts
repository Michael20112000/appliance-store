import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { resolveAuthBaseURL } from "@/lib/auth-url";

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  plugins: [adminClient()],
});
