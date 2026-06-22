import { NextRequest, NextResponse } from "next/server";
import { deleteExpired } from "@/lib/letters";

export const dynamic = "force-dynamic";

/**
 * Expiry sweep for hosted cron (e.g. Vercel Cron). Protected by CRON_SECRET:
 *   curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/cleanup
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await deleteExpired();
  return NextResponse.json({ ok: true, ...result });
}
