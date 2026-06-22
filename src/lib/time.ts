// Everything in Drift lives for 24 hours from when the letter was written.
export const EXPIRY_MS = 24 * 60 * 60 * 1000;

// Letters and replies cap out at a gentle length. this is a quiet space, not a feed.
export const MAX_BODY = 1500;

export function expiresAtFromNow(): Date {
  return new Date(Date.now() + EXPIRY_MS);
}
