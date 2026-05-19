import { getPublicStoreContacts } from "@/server/services/store-settings.service";

export async function getStoreNap() {
  const contacts = await getPublicStoreContacts();
  const primaryPhone = contacts.phones[0];
  const primaryAddress = contacts.addresses[0];

  return {
    name: "Техніка б/у Львів",
    address: primaryAddress?.text,
    phone: primaryPhone?.digits,
  };
}
