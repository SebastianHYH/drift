import { prisma } from "@/lib/db";
import { expiresAtFromNow, MAX_BODY } from "@/lib/time";
import type { Letter, Reply } from "@prisma/client";

export type LetterWithReply = Letter & { reply: Reply | null };

function clean(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("A letter can't be empty.");
  if (trimmed.length > MAX_BODY) {
    throw new Error(`Please keep it under ${MAX_BODY} characters.`);
  }
  return trimmed;
}

/** Write a letter into the pool, drifting for the next 24 hours. */
export async function sendLetter(token: string, body: string): Promise<Letter> {
  return prisma.letter.create({
    data: { authorToken: token, body: clean(body), expiresAt: expiresAtFromNow() },
  });
}

/**
 * The letter currently waiting for this reader.
 *
 * If they already hold a claimed, unreplied, unexpired letter, return it.
 * Otherwise atomically claim one random unclaimed letter that isn't their own.
 * `FOR UPDATE SKIP LOCKED` guarantees two readers never claim the same letter.
 */
export async function getWaitingLetter(token: string): Promise<Letter | null> {
  const existing = await prisma.letter.findFirst({
    where: {
      claimedBy: token,
      expiresAt: { gt: new Date() },
      reply: { is: null },
    },
    orderBy: { claimedAt: "desc" },
  });
  if (existing) return existing;

  const rows = await prisma.$queryRaw<Letter[]>`
    UPDATE "Letter"
    SET "claimedBy" = ${token}, "claimedAt" = now()
    WHERE id = (
      SELECT id FROM "Letter"
      WHERE "claimedBy" IS NULL
        AND "authorToken" <> ${token}
        AND "expiresAt" > now()
      ORDER BY random()
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, "authorToken", body, "createdAt", "expiresAt", "claimedBy", "claimedAt";
  `;
  return rows[0] ?? null;
}

/** Reply exactly once to the letter you were handed. */
export async function replyOnce(
  token: string,
  letterId: string,
  body: string,
): Promise<Reply> {
  const cleaned = clean(body);
  const letter = await prisma.letter.findUnique({
    where: { id: letterId },
    include: { reply: true },
  });

  if (!letter || letter.expiresAt <= new Date()) {
    throw new Error("This letter has drifted away.");
  }
  if (letter.claimedBy !== token) {
    throw new Error("This letter isn't yours to answer.");
  }
  if (letter.reply) {
    throw new Error("You've already replied to this letter.");
  }

  // Replying resets the shared clock to a fresh 24h, so the sender always gets a full day to read the reply.
  const newExpiry = expiresAtFromNow();
  return prisma.$transaction(async (tx) => {
    await tx.letter.update({
      where: { id: letterId },
      data: { expiresAt: newExpiry },
    });
    return tx.reply.create({
      data: {
        letterId,
        responderToken: token,
        body: cleaned,
        expiresAt: newExpiry,
      },
    });
  });
}

/** Letters you wrote that a stranger has answered. */
export async function getMyReplies(token: string): Promise<LetterWithReply[]> {
  return prisma.letter.findMany({
    where: {
      authorToken: token,
      expiresAt: { gt: new Date() },
      reply: { isNot: null },
    },
    include: { reply: true },
    orderBy: { createdAt: "desc" },
  });
}

/** How many letters you've sent that are still drifting, unanswered. */
export async function countDrifting(token: string): Promise<number> {
  return prisma.letter.count({
    where: {
      authorToken: token,
      expiresAt: { gt: new Date() },
      reply: { is: null },
    },
  });
}

/** Remove everything past its 24-hour life. Called by the cron sweep. */
export async function deleteExpired(): Promise<{ letters: number; replies: number }> {
  const now = new Date();
  const replies = await prisma.reply.deleteMany({ where: { expiresAt: { lte: now } } });
  const letters = await prisma.letter.deleteMany({ where: { expiresAt: { lte: now } } });
  return { letters: letters.count, replies: replies.count };
}
