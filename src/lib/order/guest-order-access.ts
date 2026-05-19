import { cookies } from "next/headers";

const COOKIE_PREFIX = "guest-order-";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieName(orderNumber: string) {
  return `${COOKIE_PREFIX}${orderNumber}`;
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function writeGuestOrderCookie(
  jar: CookieStore,
  orderNumber: string,
  token: string,
) {
  jar.set(cookieName(orderNumber), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function setGuestOrderAccessCookie(
  orderNumber: string,
  token: string,
  jar?: CookieStore,
) {
  writeGuestOrderCookie(jar ?? (await cookies()), orderNumber, token);
}

export async function getGuestOrderAccessCookie(
  orderNumber: string,
): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(cookieName(orderNumber))?.value;
}
