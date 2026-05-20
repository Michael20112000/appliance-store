import type { CallbackRequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const CALLBACK_RATE_LIMIT_WINDOW_MS = 3_600_000;
export const CALLBACK_RATE_LIMIT_MAX = 5;

export const CALLBACK_NOT_FOUND = "CALLBACK_NOT_FOUND";
export const CALLBACK_NOT_CONSULTED = "CALLBACK_NOT_CONSULTED";
export const CALLBACK_ALREADY_ARCHIVED = "CALLBACK_ALREADY_ARCHIVED";

export class CallbackRateLimitError extends Error {
  constructor() {
    super("Занадто багато запитів. Спробуйте пізніше.");
    this.name = "CallbackRateLimitError";
  }
}

export type CallbackRequestAdminRow = {
  id: string;
  phone: string;
  createdAt: Date;
  status: CallbackRequestStatus;
  note: string | null;
  archivedAt: Date | null;
};

const adminRowSelect = {
  id: true,
  phone: true,
  createdAt: true,
  status: true,
  note: true,
  archivedAt: true,
} as const;

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

export async function listCallbackRequestsAdmin(options: {
  view: "active" | "archive";
  limit?: number;
}): Promise<CallbackRequestAdminRow[]> {
  const where =
    options.view === "active"
      ? { archivedAt: null }
      : { archivedAt: { not: null } };

  return prisma.callbackRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 200,
    select: adminRowSelect,
  });
}

export async function getCallbackViewCounts(): Promise<{
  active: number;
  archive: number;
}> {
  const [active, archive] = await Promise.all([
    prisma.callbackRequest.count({ where: { archivedAt: null } }),
    prisma.callbackRequest.count({ where: { archivedAt: { not: null } } }),
  ]);
  return { active, archive };
}

export async function updateCallbackRequestStatus(
  id: string,
  status: CallbackRequestStatus,
): Promise<void> {
  const row = await prisma.callbackRequest.findUnique({ where: { id } });
  if (!row) throw new Error(CALLBACK_NOT_FOUND);
  if (row.archivedAt) throw new Error(CALLBACK_ALREADY_ARCHIVED);

  await prisma.callbackRequest.update({
    where: { id },
    data: { status },
  });
}

/** Empty or whitespace-only notes persist as null, never "". */
export async function updateCallbackRequestNote(
  id: string,
  note: string,
): Promise<void> {
  const row = await prisma.callbackRequest.findUnique({ where: { id } });
  if (!row) throw new Error(CALLBACK_NOT_FOUND);
  if (row.archivedAt) throw new Error(CALLBACK_ALREADY_ARCHIVED);

  const trimmed = note.trim();
  const normalized = trimmed.length === 0 ? null : trimmed;

  await prisma.callbackRequest.update({
    where: { id },
    data: { note: normalized },
  });
}

export async function archiveCallbackRequest(id: string): Promise<void> {
  const row = await prisma.callbackRequest.findUnique({ where: { id } });
  if (!row) throw new Error(CALLBACK_NOT_FOUND);
  if (row.archivedAt) throw new Error(CALLBACK_ALREADY_ARCHIVED);
  if (row.status !== "CONSULTED") throw new Error(CALLBACK_NOT_CONSULTED);

  await prisma.callbackRequest.update({
    where: { id },
    data: { archivedAt: new Date() },
  });
}
