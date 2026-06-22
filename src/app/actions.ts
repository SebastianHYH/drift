"use server";

import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/identity";
import { sendLetter, replyOnce } from "@/lib/letters";

export type ActionResult = { ok: boolean; error?: string };

function fail(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
}

export async function sendLetterAction(body: string): Promise<ActionResult> {
  try {
    const token = await getToken();
    await sendLetter(token, body);
    revalidatePath("/inbox");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function replyAction(letterId: string, body: string): Promise<ActionResult> {
  try {
    const token = await getToken();
    await replyOnce(token, letterId, body);
    revalidatePath("/inbox");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
