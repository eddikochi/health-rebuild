import { useEffect, useState } from "react";

// Tick de relógio. O tempo restante é sempre derivado de restEndsAt - now,
// então o timer sobrevive a reload/suspensão da aba (PRD §8).
export function useNow(active: boolean, intervalMs = 500): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return (
    String(Math.floor(s / 60)).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0")
  );
}
