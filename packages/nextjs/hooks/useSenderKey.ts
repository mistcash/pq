import type { Address, Hex } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError } from "~~/utils/friendly";
import { createPasskey, passkeyOutput } from "~~/utils/passkey";

/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

/** Your Sender Key, from your passkey (ADR-0004). */
export const useSenderKey = (onStep: (step: "passkey") => void) => {
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });

  /** Makes a passkey for a User who's joining, and gives its Sender Key. */
  const join = async (me: Address) => {
    onStep("passkey");
    const prfOutput = await createPasskey(me);
    const senderKey = (await loadCrypto()).senderKey(prfOutput);
    senderKeys.set(me, senderKey);
    return senderKey;
  };

  /** Asks for your passkey once per page session, refusing one whose Sender Key doesn't give back your User Key. */
  const unlock = async (me: Address) => {
    if (!senderKeys.has(me)) {
      onStep("passkey");
      const prfOutput = await passkeyOutput();
      const crypto = await loadCrypto();
      const senderKey = crypto.senderKey(prfOutput);
      if (crypto.userKey(senderKey) !== (await pqMsg!.read.userKeys([me]))) {
        throw new FriendlyError("That passkey doesn't unlock this wallet. Pick the one you made when it joined.");
      }
      senderKeys.set(me, senderKey);
    }
    return senderKeys.get(me)!;
  };

  return { join, unlock };
};
