"use client";

import { useEffect, useRef, useState } from "react";
import { checkUsername } from "@/lib/api/client/auth-client";

export type UsernameStatus = "idle" | "checking" | "available" | "taken";

export function useUsernameAvailability() {
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function scheduleCheck(rawUsername: string): string {
    const normalized = rawUsername.replace(/[^a-zA-Z0-9_]/g, "");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (normalized.length < 3) {
      setStatus("idle");
      return normalized;
    }

    setStatus("checking");
    timerRef.current = setTimeout(async () => {
      const result = await checkUsername(normalized);
      setStatus(result.available ? "available" : "taken");
    }, 500);

    return normalized;
  }

  return {
    status,
    scheduleCheck,
  };
}

