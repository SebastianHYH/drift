/**
 * Registered by Next on server start. Runs an in-process sweep every 5 minutes
 * to delete letters and replies past their 24-hour life. Reads already filter
 * by expiry, so this is purely housekeeping. Node runtime only (not edge).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { deleteExpired } = await import("@/lib/letters");
  const FIVE_MINUTES = 5 * 60 * 1000;

  const sweep = async () => {
    try {
      const { letters, replies } = await deleteExpired();
      if (letters || replies) {
        console.log(`[drift] swept ${letters} letters, ${replies} replies`);
      }
    } catch (err) {
      console.error("[drift] expiry sweep failed", err);
    }
  };

  // .unref() so the timer never keeps the process alive on its own.
  setInterval(sweep, FIVE_MINUTES).unref();
  console.log("[drift] expiry sweep scheduled (every 5 minutes)");
}
