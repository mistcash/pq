import type { Address, Hex } from "viem";
import { useSignMessage } from "wagmi";
import { askPassword } from "~~/components/PasswordPrompt";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError } from "~~/utils/friendly";

const SIGN_MESSAGE = "pqmsg: derive Sender Key v1";
/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

/**
 * Gets your Sender Key from your password and a wallet signature, asking once more the first time to check the wallet
 * signs alike. Once you've joined, a password that doesn't give back your User Key is refused (ADR-0004).
 */
export const useSenderKey = (onStep: (step: "password" | "sign" | "check") => void) => {
  const { signMessageAsync } = useSignMessage();
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });

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
      const userKey = (await pqMsg!.read.userKeys([me])) as Hex;
      onStep("password");
      const password = await askPassword(userKey === "0x");
      const crypto = await loadCrypto();
      const senderKey = crypto.senderKey(await signTwiceFirstTime(me), password);
      if (userKey !== "0x" && crypto.userKey(senderKey) !== userKey) {
        throw new FriendlyError("That's not your password. Try again?");
      }
      senderKeys.set(me, senderKey);
    }
    return senderKeys.get(me)!;
  };
};
