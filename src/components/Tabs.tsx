import Link from "next/link";

type Tab = "waiting" | "replied";

export default function Tabs({ active }: { active: Tab }) {
  const base =
    "pb-2 text-sm tracking-wide transition-colors border-b-2 -mb-px";
  const on = "border-accent text-ink";
  const off = "border-transparent text-ink-soft hover:text-accent";

  return (
    <div className="mb-8 flex gap-8 border-b border-edge">
      <Link href="/inbox?tab=waiting" className={`${base} ${active === "waiting" ? on : off}`}>
        Waiting for you
      </Link>
      <Link href="/inbox?tab=replied" className={`${base} ${active === "replied" ? on : off}`}>
        Yours, replied
      </Link>
    </div>
  );
}
