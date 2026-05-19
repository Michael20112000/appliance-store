import { prisma } from "@/lib/db";

export const CALLBACK_RATE_LIMIT_WINDOW_MS = 3_600_000;
export const CALLBACK_RATE_LIMIT_MAX = 5;

export class CallbackRateLimitError extends Error {
  constructor() {
    super("Занадто багато запитів. Спробуйте пізніше.");
    this.name = "CallbackRateLimitError";
  }
}

async function enforceCallbackRateLimit(ipAddress: string | null) {
  if (!ipAddress) return;

  const since = new Date(Date.now() - CALLBACK_RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.callbackRequest.count({
    where: {
      ipAddress,
      createdAt: { gte: since },
    },
  });

  if (recent >= CALLBACK_RATE_LIMIT_MAX) {
    throw new CallbackRateLimitError();
  }
}

export async function createCallbackRequest(input: {
  phone: string;
  ipAddress: string | null;
}): Promise<void> {
  const digits = input.phone.trim();
  await enforceCallbackRateLimit(input.ipAddress);

  await prisma.callbackRequest.create({
    data: {
      phone: digits,
      ipAddress: input.ipAddress,
    },
  });
}
