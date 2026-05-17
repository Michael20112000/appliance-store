import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const chatParsers = {
  chat: parseAsStringLiteral(["open"] as const),
  productId: parseAsString,
};

export const chatSearchParamsCache = createSearchParamsCache(chatParsers);

export const chatUrlKeys = {
  chat: "chat",
  productId: "productId",
};
