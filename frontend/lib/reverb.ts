"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getReverbAppKey, getReverbHost, getReverbPort, getReverbScheme } from "@/lib/env";

declare global {
  interface Window {
    __queueEcho?: Echo<"reverb">;
    Pusher?: typeof Pusher;
  }
}

export function getQueueEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.__queueEcho) {
    return window.__queueEcho;
  }

  const key = getReverbAppKey();
  if (!key) {
    return null;
  }

  const scheme = getReverbScheme();
  const host = getReverbHost();
  const port = getReverbPort();
  const isTls = scheme === "https";

  window.Pusher = Pusher;

  window.__queueEcho = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: isTls,
    enabledTransports: ["ws", "wss"],
  });

  return window.__queueEcho;
}
