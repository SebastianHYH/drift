# Drift

An anonymous, ephemeral letter platform for mental health and connection.

Write a letter it's delivered to **one random stranger**, who may reply **once**.
Both the letter and the reply quietly disappear **24 hours** after the letter was written.
No accounts, no usernames, no choosing who you write to or hear from.

## How it works

- **Identity** is a single anonymous `drift_token` httpOnly cookie, minted by
  `src/middleware.ts` on first visit. There are no logins or profiles.
- **Delivery is pull-based.** A written letter enters a pool, unclaimed. When someone
  opens **Waiting for you**, they're atomically handed one random unclaimed letter that
  isn't their own (`SELECT … FOR UPDATE SKIP LOCKED`), so exactly one stranger ever
  receives it. See `getWaitingLetter` in `src/lib/letters.ts`.
- **One reply per letter**, enforced by a unique `letterId` on `Reply`. The reply routes
  back to the author's **Yours, replied** tab and expires when the letter does.
- **Expiry** is enforced two ways: every read filters on `expiresAt > now()`, and a
  housekeeping sweep deletes expired rows, in-process every 5 min
  (`src/instrumentation.ts`) and via `GET /api/cron/cleanup` for hosted cron.

## Tech stack

Next.js (App Router) · React 19 · Tailwind v4 · Prisma · PostgreSQL.

## Running locally

You need a Postgres reachable at the `DATABASE_URL` in `.env`
(`postgresql://drift:drift@localhost:5432/drift`).

```bash
cp .env.example .env
docker compose up -d        # starts Postgres on :5432
npm install
npx prisma migrate dev      # create the schema
npx prisma db seed          # add a few letters so you can try it solo
npm run dev                 # http://localhost:3000
```

> No Docker daemon? Any local Postgres works. Point `DATABASE_URL` at it and run the
> `prisma migrate`/`seed` steps. (This repo was first verified against a local cluster
> using the same connection string.)

### Try the full loop solo

1. Open `/`, write a letter, send it.
2. Open `/inbox` → **Waiting for you** hands you a seeded stranger's letter with a live
   countdown. Reply once.
3. In a private/incognito window (a fresh `drift_token`), write a letter as identity A,
   then claim + reply as identity B, then back in window A open **Yours, replied** to see
   B's answer. You can never be handed your own letter.

### Integration check

`node scripts/verify.mjs` exercises the claim/reply/expiry invariants against the database.

## Production notes

- Set a real `CRON_SECRET` and call `/api/cron/cleanup` from a scheduler
  (`Authorization: Bearer <secret>`).
- **Out of scope for this build:** real content moderation (filtering, reporting, rate
  limiting). For an anonymous mental-health space, add these before any public launch.
  A crisis-resources line is shown in the footer.
