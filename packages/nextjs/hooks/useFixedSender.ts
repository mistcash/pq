import { usePublicClient } from "wagmi";
import { FriendlyError } from "~~/utils/friendly";

/** Sends a typed request through the Fixed Sender and waits until it lands. `onSent` runs once it's on its way. */
export const useFixedSender = () => {
  const publicClient = usePublicClient();
  return async (request: object, onSent?: () => void) => {
    const response = await fetch("/api/fixed-sender", { method: "POST", body: JSON.stringify(request) });
    const { hash, error } = await response.json();
    if (error) throw new FriendlyError(error);
    onSent?.();
    if ((await publicClient!.waitForTransactionReceipt({ hash })).status !== "success") {
      throw new FriendlyError("That didn't go through. Try again?");
    }
  };
};
