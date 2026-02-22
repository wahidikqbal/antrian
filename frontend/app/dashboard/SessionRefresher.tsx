"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "@/lib/env";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function SessionRefresher() {
  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });
      } catch {
        // Ignore transient network failures; session check guard will handle invalid states.
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
