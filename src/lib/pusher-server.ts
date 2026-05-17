import Pusher from "pusher";
import { getEnv } from "@/lib/env";

export class PusherNotConfiguredError extends Error {
  constructor() {
    super(
      "PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET та PUSHER_CLUSTER обовʼязкові для realtime чату",
    );
    this.name = "PusherNotConfiguredError";
  }
}

let server: Pusher | undefined;

export function getPusherServer(): Pusher {
  const env = getEnv();
  const appId = env.PUSHER_APP_ID;
  const key = env.PUSHER_KEY;
  const secret = env.PUSHER_SECRET;
  const cluster = env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new PusherNotConfiguredError();
  }

  if (!server) {
    server = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return server;
}

export function conversationChannel(conversationId: string): string {
  return `private-conversation-${conversationId}`;
}
