import Tabs from "@/components/Tabs";
import LetterCard from "@/components/LetterCard";
import ReplyForm from "@/components/ReplyForm";
import { getToken } from "@/lib/identity";
import { getWaitingLetter, getMyReplies, countDrifting } from "@/lib/letters";

// Reads identity and claims letters, so it must never be cached.
export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab === "replied" ? "replied" : "waiting";
  const token = await getToken();

  return (
    <div className="mx-auto max-w-2xl">
      <Tabs active={active} />
      {active === "waiting" ? (
        <WaitingTab token={token} />
      ) : (
        <RepliedTab token={token} />
      )}
    </div>
  );
}

async function WaitingTab({ token }: { token: string }) {
  // Opening this tab hands the reader one random stranger's letter.
  const letter = await getWaitingLetter(token);

  if (!letter) {
    return (
      <Empty
        title="No letters are waiting just now."
        body="The drift is quiet. Check back in a little while or write one of your own."
      />
    );
  }

  return (
    <LetterCard
      label="A letter found its way to you"
      body={letter.body}
      expiresAt={letter.expiresAt.toISOString()}
    >
      <ReplyForm letterId={letter.id} />
    </LetterCard>
  );
}

async function RepliedTab({ token }: { token: string }) {
  const [letters, drifting] = await Promise.all([
    getMyReplies(token),
    countDrifting(token),
  ]);

  if (letters.length === 0) {
    return (
      <Empty
        title="No replies yet."
        body={
          drifting > 0
            ? `${drifting} of your letter${drifting === 1 ? " is" : "s are"} still drifting. If a stranger answers, it will appear here.`
            : "When someone answers a letter you wrote, you'll find their reply here."
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {letters.map((letter) => (
        <LetterCard
          key={letter.id}
          label="You wrote"
          body={letter.body}
          expiresAt={letter.expiresAt.toISOString()}
        >
          {letter.reply && (
            <div className="mt-6 border-t border-edge pt-5">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-accent">
                A stranger replied
              </p>
              <p className="whitespace-pre-wrap text-[1.05rem] italic leading-[1.8] text-ink">
                {letter.reply.body}
              </p>
            </div>
          )}
        </LetterCard>
      ))}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="paper drift-in rounded-sm border border-edge px-7 py-14 text-center">
      <p className="text-lg italic text-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
