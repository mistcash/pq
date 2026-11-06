import { useState } from "react";
import type { Address, Hex } from "viem";
import { useSignMessage } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChannelKeyHashes } from "~~/hooks/useChannelKeyHashes";
import { useFixedSender } from "~~/hooks/useFixedSender";
import { saveChannelKey } from "~~/utils/channels";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError, friendlyMessage } from "~~/utils/friendly";

export type OpenStep = "start" | "sign" | "check" | "prove" | "send" | "confirm" | "open";

const SIGN_MESSAGE = "pqmsg: derive Sender Key v1";
/** Sender Keys live in memory only, for this page session (ADR-0002). */
const senderKeys = new Map<Address, Hex>();

/** Lets the current step render before proving blocks the page. */
const painted = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));

/** Opens a Channel to another User through the Fixed Sender, or finds the one already open. */
export const useOpenChannel = () => {
  const [step, setStep] = useState<OpenStep>();
  const [error, setError] = useState<string>();
  const [restored, setRestored] = useState<number>();
  const { signMessageAsync } = useSignMessage();
  const { refetch: getUsers } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getUsers" });
  const channelKeyHashes = useChannelKeyHashes();
  const fixedSender = useFixedSender();

  const signTwiceFirstTime = async (me: Address) => {
    setStep("sign");
    const signature = await signMessageAsync({ message: SIGN_MESSAGE });
    const checked = `pqmsg:signs-alike:${me}`;
    if (!localStorage.getItem(checked)) {
      setStep("check");
      if ((await signMessageAsync({ message: SIGN_MESSAGE })) !== signature) {
        throw new FriendlyError(
          "Your wallet signed the same thing two different ways, so it can't keep your chats. Try another wallet.",
        );
      }
      localStorage.setItem(checked, "1");
    }
    return signature;
  };

  const senderKey = async (me: Address) => {
    if (!senderKeys.has(me)) senderKeys.set(me, (await loadCrypto()).senderKey(await signTwiceFirstTime(me)));
    return senderKeys.get(me)!;
  };

  const open = async (me: Address, other: Address) => {
    setStep("start");
    setError(undefined);
    try {
      const crypto = loadCrypto();
      const { data: users } = await getUsers({ throwOnError: true });
      const index = users!.indexOf(other);
      if (index < 0) throw new FriendlyError("They haven't joined pqmsg yet. Ask them to join first!");
      const channelKey = (await crypto).channelKey(await senderKey(me), index);
      const channelKeyHash = (await crypto).channelKeyHash(channelKey);
      if (!(await channelKeyHashes()).has(BigInt(channelKeyHash))) {
        setStep("prove");
        await painted();
        const { proof } = (await crypto).prove(channelKey);
        setStep("send");
        await fixedSender({ type: "openChannel", channelKeyHash, proof }, () => setStep("confirm"));
      }
      saveChannelKey(me, other, channelKey);
      setStep("open");
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  /** Finds every Channel you opened from your signature alone (ADR-0002), and caches each Channel Key. */
  const restore = async (me: Address) => {
    setStep("start");
    const crypto = await loadCrypto();
    const key = await senderKey(me);
    setStep("prove");
    const { data: users } = await getUsers({ throwOnError: true });
    const hashes = await channelKeyHashes();
    let found = 0;
    users!.forEach((user: Address, j: number) => {
      const channelKey = crypto.channelKey(key, j);
      if (!hashes.has(BigInt(crypto.channelKeyHash(channelKey)))) return;
      saveChannelKey(me, user, channelKey);
      found++;
    });
    setRestored(found);
  };

  return { step, error, open, restored, restore };
};
