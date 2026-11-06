import type { Address, Hex } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError } from "~~/utils/friendly";
import { createPasskey, passkeyOutput } from "~~/utils/passkey";

/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

export type UnlockStep = "passkey";

/**
 * Gets your Sender Key from your passkey, which Join makes (ADR-0004). Once you've joined, a passkey whose Sender Key
 * doesn't give back your User Key is refused.
 */
export const useSenderKey = (onStep: (step: UnlockStep) => void) => {
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });

  /** Only Join passes `isNew`: a lagging read must never skip the check. */
  return async (me: Address, isNew = false) => {
    if (!senderKeys.has(me)) {
      onStep("passkey");
      const output = isNew ? await createPasskey(me) : await passkeyOutput();
      const crypto = await loadCrypto();
      const senderKey = crypto.senderKey(output);
      if (!isNew && crypto.userKey(senderKey) !== (await pqMsg!.read.userKeys([me]))) {
        throw new FriendlyError("That passkey is for another wallet. Pick the one named after this wallet.");
      }
      senderKeys.set(me, senderKey);
    }
    return senderKeys.get(me)!;
  };
};
