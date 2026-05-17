// Import ONLY from client components (e.g. ChatProvider, ChatThread).
import Pusher from "pusher-js";

let client: Pusher | null = null;

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
      },
    });
  }

  return client;
}
