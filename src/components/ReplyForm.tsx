"use client";

import { useState, useTransition } from "react";
import { replyAction } from "@/app/actions";
import { MAX_BODY } from "@/lib/time";

export default function ReplyForm({ letterId }: { letterId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remaining = MAX_BODY - body.length;
  const canSend = body.trim().length > 0 && remaining >= 0 && !pending;

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await replyAction(letterId, body);
      // On success the inbox revalidates and this card is replaced by the
      // empty/next state, so there's nothing more to render here.
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      // also delete the body so the next mail that comes in starts with an empty form, rather than whatever the reader had typed before.
      setBody("");
    });
  }

  return (
    <div className="mt-6 border-t border-edge pt-5">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        Reply once
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="You can only answer once. There's no rush…"
        rows={5}
        className="w-full resize-none rounded-sm border border-edge bg-paper px-5 py-4 text-[1.05rem] leading-[1.8] text-ink placeholder:text-ink-soft/60 focus:border-accent-soft focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${remaining < 0 ? "text-accent" : "text-ink-soft"}`}>
          {remaining} characters left
        </span>
        <button
          onClick={send}
          disabled={!canSend}
          className="rounded-full bg-ink px-6 py-2 text-sm tracking-wide text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send your reply"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </div>
  );
}
