"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "You matter.",
  "Don't hesitate to reach out for help if you need it.",
  "Somewhere, a stranger is glad you wrote.",
  "Be gentle with yourself today.",
];

/** Rotates through a set of quiet, encouraging lines in the footer. */
export default function QuoteFooter() {
  // Always start on the first line so server and client agree (no hydration
  // mismatch); the timer simply advances from there.
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    // Each tick begins the exit; advancing the quote waits for it to finish.
    const id = setInterval(() => setPhase("out"), 30000);
    return () => clearInterval(id);
  }, []);

  // Once the drift-out finishes, swap the text and play drift-in. The drift-in's
  // own animationend fires here too, but only the "out" phase needs handling.
  function handleAnimationEnd() {
    if (phase === "out") {
      setIndex((i) => (i + 1) % QUOTES.length);
      setPhase("in");
    }
  }

  return (
    <p
      className={`mt-2 ${phase === "out" ? "drift-out" : "drift-in"}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {QUOTES[index]}
    </p>
  );
}
