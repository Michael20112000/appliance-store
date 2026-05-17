import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/db";
import { getTrustedAuthOrigins } from "@/lib/auth-url";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "buyer",
    }),
    nextCookies(),
  ],
  trustedOrigins: getTrustedAuthOrigins(),
});
