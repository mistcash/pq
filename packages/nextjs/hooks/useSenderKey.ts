import type { Address, Hex } from "viem";
import { useSignMessage } from "wagmi";
import { askPassword } from "~~/components/PasswordPrompt";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { recordStep } from "~~/services/store/deepDive";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError } from "~~/utils/friendly";

const SIGN_MESSAGE = "pqmsg: derive Sender Key v1";
/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

export type UnlockStep = "password" | "sign" | "check";

/**
 * Gets your Sender Key from your Password and a wallet signature, asking once more the first time to check the wallet
 * signs alike. Once you've joined, a Password that doesn't give back your User Key is refused (ADR-0004).
 */
export const useSenderKey = (onStep: (step: UnlockStep) => void) => {
  const { signMessageAsync } = useSignMessage();
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });

  const signTwiceFirstTime = async (me: Address) => {
    onStep("sign");
    const signature = await signMessageAsync({ account: me, message: SIGN_MESSAGE });
    const checked = `pqmsg:signs-alike:${me}`;
    if (!localStorage.getItem(checked)) {
      onStep("check");
      if ((await signMessageAsync({ account: me, message: SIGN_MESSAGE })) !== signature) {
        throw new FriendlyError(
          "Your wallet signed the same thing two different ways, so it can't keep your chats. Try another wallet.",
        );
      }
      localStorage.setItem(checked, "1");
    }
    return signature;
  };

  /** Only Join passes `isNew`: a lagging read must never skip the Password check. */
  return async (me: Address, isNew = false) => {
    if (!senderKeys.has(me)) {
      onStep("password");
      const password = await askPassword(isNew);
      const crypto = await loadCrypto();
      const signature = await signTwiceFirstTime(me);
      const senderKey = crypto.senderKey(signature, password);
      const userKey = crypto.userKey(senderKey);
      if (!isNew && userKey !== (await pqMsg!.read.userKeys([me]))) {
        throw new FriendlyError("That's not your password. Try again?");
      }
      senderKeys.set(me, senderKey);
      recordStep("unlock", { signature, senderKey, userKey });
    }
    return senderKeys.get(me)!;
  };
};
