"use client";

import { useEffect, useState } from "react";

function format(ms: number): string {
  if (ms <= 0) return "gone";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  if (minutes > 0) {
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s left`;
  }
  return `${Math.floor(ms / 1000)}s left`;
}

/** Live countdown to a letter's disappearance. `expiresAt` is an ISO string. */
export default function Countdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const fading = remaining < 60 * 60 * 1000; // under an hour

  return (
    <span
      className={`text-xs tracking-wide ${fading ? "text-accent" : "text-ink-soft"}`}
      title={`Disappears at ${new Date(expiresAt).toLocaleString()}`}
    >
      {format(remaining)}
    </span>
  );
}
