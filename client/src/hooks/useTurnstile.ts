"use client";

import { useState, useCallback, useRef } from "react";

export interface TurnstileRef {
  reset: () => void;
}

export function useTurnstile() {
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  }, []);

  return {
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    turnstileRef,
  };
}
