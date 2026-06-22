import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A few letters from imaginary strangers, so a solo visitor can open the inbox
// and immediately be handed something to reply to. All authored by demo tokens
// (never your own), so they're always claimable by you.
const SEED_LETTERS = [
  "I moved to a new city three weeks ago and I haven't spoken to anyone who knows my name. Tonight the streetlight outside my window flickers and I find it strangely comforting. I hope wherever you are, something small is keeping you company too.",
  "I keep a list of tiny good things. A warm mug. The first cold morning of autumn. A song that finds me at the right moment. Today I'm adding: a stranger, somewhere, reading this. Tell me one of yours?",
  "Some days I'm fine and some days the weight is hard to name. Today is a heavy one. I'm not asking to be fixed, I just wanted to say it out loud to someone who can't see my face.",
  "I forgave someone today, quietly, without telling them. It felt like setting down a bag I'd been carrying so long I forgot it was heavy. I wanted to put it somewhere that wasn't only inside my own head.",
  "There's a tree on my walk that I've watched through a whole year now. Bare, then green, then gold, then bare again. I think I needed to learn that things can empty out completely and still come back. Maybe you needed to hear that too.",
];

const EXPIRY_MS = 24 * 60 * 60 * 1000;

async function main() {
  // Each seed letter gets its own demo author so none collide with a real reader.
  const data = SEED_LETTERS.map((body, i) => ({
    authorToken: `seed-stranger-${i + 1}`,
    body,
    expiresAt: new Date(Date.now() + EXPIRY_MS),
  }));

  const result = await prisma.letter.createMany({ data });
  console.log(`Seeded ${result.count} drifting letters.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
