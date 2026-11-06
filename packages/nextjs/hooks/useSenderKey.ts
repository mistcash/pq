import type { Address, Hex } from "viem";
import { useSignMessage } from "wagmi";
import { recordStep } from "~~/services/store/deepDive";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError } from "~~/utils/friendly";

const SIGN_MESSAGE = "pqmsg: derive Sender Key v1";
/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

/** Gets your Sender Key from a wallet signature, asking once more the first time to check the wallet signs alike. */
export const useSenderKey = (onStep: (step: "sign" | "check") => void) => {
  const { signMessageAsync } = useSignMessage();

  const signTwiceFirstTime = async (me: Address) => {
    onStep("sign");
    const signature = await signMessageAsync({ message: SIGN_MESSAGE });
    const checked = `pqmsg:signs-alike:${me}`;
    if (!localStorage.getItem(checked)) {
      onStep("check");
      if ((await signMessageAsync({ message: SIGN_MESSAGE })) !== signature) {
        throw new FriendlyError(
          "Your wallet signed the same thing two different ways, so it can't keep your chats. Try another wallet.",
        );
      }
      localStorage.setItem(checked, "1");
    }
    return signature;
  };

  return async (me: Address) => {
    if (!senderKeys.has(me)) {
      const crypto = await loadCrypto();
      const signature = await signTwiceFirstTime(me);
      const senderKey = crypto.senderKey(signature);
      senderKeys.set(me, senderKey);
      recordStep("unlock", { signature, senderKey, userKey: crypto.userKey(senderKey) });
    }
    return senderKeys.get(me)!;
  };
};
