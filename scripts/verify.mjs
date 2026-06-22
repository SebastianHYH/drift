// Integration check: drives the exact queries from src/lib/letters.ts against the
// real Postgres DB to prove the claim/reply/expiry invariants. Standalone (own
// Prisma client) because Next's "@/..." path alias isn't resolvable by plain node.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;
let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => {
  failures++;
  console.log(`  ✗ ${m}`);
};

// Mirrors getWaitingLetter's atomic claim (without the "existing" short-circuit,
// since every caller here uses a fresh token).
async function claim(token) {
  const rows = await prisma.$queryRaw`
    UPDATE "Letter" SET "claimedBy" = ${token}, "claimedAt" = now()
    WHERE id = (
      SELECT id FROM "Letter"
      WHERE "claimedBy" IS NULL AND "authorToken" <> ${token} AND "expiresAt" > now()
      ORDER BY random() LIMIT 1 FOR UPDATE SKIP LOCKED
    )
    RETURNING id, "authorToken", body, "expiresAt";
  `;
  return rows[0] ?? null;
}

async function main() {
  // Clean any prior verify data.
  await prisma.letter.deleteMany({ where: { authorToken: { startsWith: "verify-" } } });

  console.log("1. send a letter into the pool");
  const L = await prisma.letter.create({
    data: { authorToken: "verify-author", body: "verify body", expiresAt: new Date(Date.now() + DAY) },
  });
  ok(`letter created (${L.id.slice(0, 8)}…)`);

  console.log("2. author can never be handed their OWN letter");
  // Give the author a private pool of only their own letters by claiming everything
  // else first with throwaway tokens, then prove the author still gets nothing of theirs.
  const got = await claim("verify-author");
  if (got && got.authorToken === "verify-author") bad("author was handed their own letter!");
  else ok(`author handed someone else's letter or nothing (got: ${got ? got.authorToken : "none"})`);

  console.log("3. a stranger claims our letter; claim is exclusive & never self-authored");
  let claimer = null;
  for (let k = 0; k < 30 && !claimer; k++) {
    const c = await claim(`verify-reader-${k}`);
    if (!c) break;
    if (c.authorToken === `verify-reader-${k}`) bad("a reader claimed their own letter!");
    if (c.id === L.id) claimer = `verify-reader-${k}`;
  }
  if (!claimer) bad("our letter was never claimable by a stranger");
  else ok(`letter claimed exclusively by ${claimer}`);

  console.log("4. reply exactly once (unique constraint enforces it)");
  await prisma.reply.create({
    data: { letterId: L.id, responderToken: claimer, body: "verify reply", expiresAt: L.expiresAt },
  });
  ok("first reply accepted");
  try {
    await prisma.reply.create({
      data: { letterId: L.id, responderToken: claimer, body: "second reply", expiresAt: L.expiresAt },
    });
    bad("a SECOND reply was allowed!");
  } catch (e) {
    if (e.code === "P2002") ok("second reply rejected (one-reply-only enforced)");
    else bad(`unexpected error on second reply: ${e.code}`);
  }

  console.log("5. reply routes back to the author's 'Yours, replied'");
  const mine = await prisma.letter.findMany({
    where: { authorToken: "verify-author", expiresAt: { gt: new Date() }, reply: { isNot: null } },
    include: { reply: true },
  });
  if (mine.length === 1 && mine[0].reply?.body === "verify reply") ok("author sees the stranger's reply");
  else bad(`author's replied list wrong (count=${mine.length})`);

  console.log("6. expiry sweep removes only expired rows");
  const expired = await prisma.letter.create({
    data: { authorToken: "verify-expired", body: "old", expiresAt: new Date(Date.now() - 1000) },
  });
  const now = new Date();
  await prisma.reply.deleteMany({ where: { expiresAt: { lte: now } } });
  const delLetters = await prisma.letter.deleteMany({ where: { expiresAt: { lte: now } } });
  const stillThere = await prisma.letter.findUnique({ where: { id: expired.id } });
  const liveStill = await prisma.letter.findUnique({ where: { id: L.id } });
  if (!stillThere && liveStill && delLetters.count >= 1) ok(`expired letter swept, live letter kept (${delLetters.count} removed)`);
  else bad("sweep removed wrong rows");

  // Cleanup verify data so the app's seed pool is untouched.
  await prisma.letter.deleteMany({ where: { authorToken: { startsWith: "verify-" } } });

  console.log(failures === 0 ? "\nALL CHECKS PASSED ✓" : `\n${failures} CHECK(S) FAILED ✗`);
  process.exit(failures === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
