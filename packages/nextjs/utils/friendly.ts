/** An error whose message is written for people, so the UI can show it as it is. */
export class FriendlyError extends Error {}

/** A FriendlyError's message, or a gentle catch-all for anything else, such as a wallet, network or chain error. */
export const friendlyMessage = (e: unknown) =>
  e instanceof FriendlyError ? e.message : "Something went wrong. Try again?";
