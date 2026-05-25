// Import ONLY from client components (e.g. ChatProvider, ChatThread).
import Pusher from "pusher-js";

let client: Pusher | null = null;

// Module-level guestToken — updated by ChatProvider before each Pusher subscription.
// paramsProvider() reads this at auth-request time, injecting guestToken into the
// POST body sent to /api/chat/pusher/auth so guests can authorize private channels.
let currentGuestToken: string | null = null;

export function setGuestTokenForPusher(token: string | null): void {
  currentGuestToken = token;
}

export function isPusherClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  );
}

export function getPusherClient(): Pusher {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      "NEXT_PUBLIC_PUSHER_KEY та NEXT_PUBLIC_PUSHER_CLUSTER обовʼязкові для клієнта чату",
    );
  }

  if (!client) {
    client = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/chat/pusher/auth",
        transport: "ajax",
        // paramsProvider is called by pusher-js at auth time — injects guestToken
        // into the POST body so /api/chat/pusher/auth can verify guest channel access.
        paramsProvider: () =>
          currentGuestToken ? { guestToken: currentGuestToken } : {},
      },
    });
  }

  return client;
}
