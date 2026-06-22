"use client";

import { useState, useTransition } from "react";
import { sendLetterAction } from "@/app/actions";
import { MAX_BODY } from "@/lib/time";

export default function WriteForm() {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remaining = MAX_BODY - body.length;
  const canSend = body.trim().length > 0 && remaining >= 0 && !pending;

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await sendLetterAction(body);
      if (result.ok) {
        setSent(true);
        setBody("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  if (sent) {
    return (
      <div className="paper drift-in rounded-sm border border-edge px-7 py-10 text-center">
        <p className="text-xl italic text-ink">Your letter is drifting…</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          It will find one stranger. They may write back once.
          <br />
          In a day, it&apos;s gone, whether answered or not.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-7 text-sm text-accent underline-offset-4 hover:underline"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <div className="drift-in">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write to no one in particular. Say the thing you've been carrying…"
        rows={9}
        autoFocus
        className="paper w-full resize-none rounded-sm border border-edge px-6 py-5 text-[1.075rem] leading-[1.85] text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${remaining < 0 ? "text-accent" : "text-ink-soft"}`}>
          {remaining} characters left
        </span>
        <button
          onClick={send}
          disabled={!canSend}
          className="rounded-full bg-ink px-7 py-2.5 text-sm tracking-wide text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send into the drift"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </div>
  );
}
