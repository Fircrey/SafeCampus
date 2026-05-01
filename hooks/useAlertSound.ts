"use client";

import { useCallback, useRef } from "react";

export function useAlertSound() {
  const mutedRef = useRef(false);

  const play = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext not available (SSR or blocked by browser)
    }
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    return mutedRef.current;
  }, []);

  const isMuted = useCallback(() => mutedRef.current, []);

  return { play, toggleMute, isMuted };
}
