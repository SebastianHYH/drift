import Countdown from "@/components/Countdown";

/**
 * Presentational paper card for a letter (and optionally its reply).
 * `label` is the quiet caption above the body, e.g. "A letter found its way to you".
 */
export default function LetterCard({
  label,
  body,
  expiresAt,
  children,
}: {
  label: string;
  body: string;
  expiresAt: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="paper drift-in rounded-sm border border-edge px-7 py-6 shadow-[0_1px_24px_-12px_rgba(44,42,39,0.25)]">
      <header className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">{label}</span>
        <Countdown expiresAt={expiresAt} />
      </header>
      <p className="whitespace-pre-wrap text-[1.075rem] leading-[1.85] text-ink">{body}</p>
      {children}
    </article>
  );
}
