import { cookies } from "next/headers";

export const DRIFT_TOKEN = "drift_token";

/**
 * The reader's anonymous identity. The cookie is issued by middleware.ts on the
 * first request, so it is always present by the time a page or action runs.
 */
export async function getToken(): Promise<string> {
  const store = await cookies();
  const token = store.get(DRIFT_TOKEN)?.value;
  if (!token) {
    // Should never happen. middleware guarantees the cookie. Defensive only.
    throw new Error("No identity found. Please refresh and try again.");
  }
  return token;
}
