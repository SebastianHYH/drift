import WriteForm from "@/components/WriteForm";

export default function WritePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl italic text-ink">Write to a stranger</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          One person you&apos;ll never meet will read this. They can reply once.
          <br />
          Nothing is saved for long. In 24 hours, it&apos;s gone.
        </p>
      </div>
      <WriteForm />
    </div>
  );
}
