import { prisma } from "@/lib/db";
import type { AdminStoreSettingsInput } from "@/server/validators/admin-store-settings";

export type PublicStorePhone = {
  id: string;
  digits: string;
  label: string | null;
};

export type PublicStoreEmail = {
  id: string;
  email: string;
  label: string | null;
};

export type PublicStoreAddress = {
  id: string;
  text: string;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  label: string | null;
};

export type PublicStoreContacts = {
  phones: PublicStorePhone[];
  emails: PublicStoreEmail[];
  addresses: PublicStoreAddress[];
};

const contactOrder = [{ sortOrder: "asc" as const }, { id: "asc" as const }];

export async function getPublicStoreContacts(): Promise<PublicStoreContacts> {
  const [phones, emails, addresses] = await Promise.all([
    prisma.storePhone.findMany({ orderBy: contactOrder }),
    prisma.storeEmail.findMany({ orderBy: contactOrder }),
    prisma.storeAddress.findMany({ orderBy: contactOrder }),
  ]);

  return { phones, emails, addresses };
}

export async function getAdminStoreSettings(): Promise<AdminStoreSettingsInput> {
  const contacts = await getPublicStoreContacts();
  return {
    phones: contacts.phones.map((p) => ({
      digits: p.digits,
      label: p.label ?? undefined,
    })),
    emails: contacts.emails.map((e) => ({
      email: e.email,
      label: e.label ?? undefined,
    })),
    addresses: contacts.addresses.map((a) => ({
      text: a.text,
      mapUrl: a.mapUrl ?? "",
      latitude: a.latitude ?? undefined,
      longitude: a.longitude ?? undefined,
      label: a.label ?? undefined,
    })),
  };
}

export async function saveStoreSettings(
  input: AdminStoreSettingsInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.storePhone.deleteMany();
    await tx.storeEmail.deleteMany();
    await tx.storeAddress.deleteMany();

    if (input.phones.length > 0) {
      await tx.storePhone.createMany({
        data: input.phones.map((phone, index) => ({
          digits: phone.digits,
          label: phone.label?.trim() || null,
          sortOrder: index,
        })),
      });
    }

    if (input.emails.length > 0) {
      await tx.storeEmail.createMany({
        data: input.emails.map((email, index) => ({
          email: email.email,
          label: email.label?.trim() || null,
          sortOrder: index,
        })),
      });
    }

    if (input.addresses.length > 0) {
      await tx.storeAddress.createMany({
        data: input.addresses.map((address, index) => ({
          text: address.text,
          mapUrl: address.mapUrl?.trim() || null,
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
          label: address.label?.trim() || null,
          sortOrder: index,
        })),
      });
    }
  });
}
