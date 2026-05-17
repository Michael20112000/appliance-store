import { getEnv } from "@/lib/env";

export function getStoreNap() {
  const env = getEnv();
  return {
    name: "Техніка б/у Львів",
    address: env.STORE_ADDRESS,
    phone: env.STORE_PHONE,
  };
}
