import type { Address, Hex } from "viem";
import { usePublicClient } from "wagmi";
import { FriendlyError } from "~~/utils/friendly";

/** Sends a typed request through the Fixed Sender and, once it lands, gives its hash. `onSent` runs once it's on its
 * way, with the Arkiv entity it stored, if any. */
export const useFixedSender = () => {
  const publicClient = usePublicClient();
  return async (request: object, onSent?: (entityKey?: Hex) => void) => {
    const response = await fetch("/api/fixed-sender", { method: "POST", body: JSON.stringify(request) });
    const { hash, entityKey, error } = await response.json();
    if (error) throw new FriendlyError(error);
    onSent?.(entityKey);
    if ((await publicClient!.waitForTransactionReceipt({ hash })).status !== "success") {
      throw new FriendlyError("That didn't go through. Try again?");
    }
    return hash as Hex;
  };
};

/** Asks the Fixed Sender to put your registered User Key on Arkiv (ADR-0005), and gives its entity if it made one. */
export const storeUserKey = async (user: Address, userKey: Hex) => {
  const response = await fetch("/api/fixed-sender", {
    method: "POST",
    body: JSON.stringify({ type: "userKey", user, userKey }),
  });
  const { entityKey, error } = await response.json();
  if (error) throw new FriendlyError(error);
  return entityKey as Hex | undefined;
};
