import { type Address, type Hex, keccak256 } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { storeUserKey } from "~~/hooks/useFixedSender";
import { recordEntity, recordStep } from "~~/services/store/deepDive";
import { fetchUserKey } from "~~/utils/arkiv";
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
    const crypto = await loadCrypto();
    const senderKey = crypto.senderKey(prfOutput);
    senderKeys.set(me, senderKey);
    const userKey = crypto.userKey(senderKey);
    recordStep("unlock", { prfOutput, senderKey, userKey, userKeyHash: keccak256(userKey) });
    return senderKey;
  };

  /** Asks for your passkey once per page session, refusing one whose Sender Key doesn't give back your User Key. */
  const unlock = async (me: Address) => {
    if (!senderKeys.has(me)) {
      onStep("passkey");
      const prfOutput = await passkeyOutput();
      const crypto = await loadCrypto();
      const senderKey = crypto.senderKey(prfOutput);
      const userKey = crypto.userKey(senderKey);
      const userKeyHash = keccak256(userKey);
      if (userKeyHash !== (await pqMsg!.read.userKeyHashes([me]))) {
        throw new FriendlyError("That passkey doesn't unlock this wallet. Pick the one you made when it joined.");
      }
      senderKeys.set(me, senderKey);
      recordStep("unlock", { prfOutput, senderKey, userKey, userKeyHash });
      // Stores your User Key again if it expired on Arkiv, or never got there, so people can still message you.
      if (!(await fetchUserKey(pqMsg!.address, userKeyHash))) {
        storeUserKey(me, userKey).then(entity => entity && recordEntity("unlock", entity), console.warn);
      }
    }
    return senderKeys.get(me)!;
  };

  return { join, unlock };
};
