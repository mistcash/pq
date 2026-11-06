import { useState } from "react";
import type { Address, Hex } from "viem";
import { usePublicClient, useSignMessage } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { saveChannelKey } from "~~/utils/channels";
import { loadCrypto } from "~~/utils/crypto";

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
  const publicClient = usePublicClient();
  const { refetch: getUsers } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getUsers" });
  const { refetch: getChannels } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getChannels" });

  const signTwiceFirstTime = async (me: Address) => {
    setStep("sign");
    const signature = await signMessageAsync({ message: SIGN_MESSAGE });
    const checked = `pqmsg:signs-alike:${me}`;
    if (!localStorage.getItem(checked)) {
      setStep("check");
      if ((await signMessageAsync({ message: SIGN_MESSAGE })) !== signature) {
        throw new Error(
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
      if (index < 0) throw new Error("They haven't joined pqmsg yet. Ask them to join first!");
      const channelKey = (await crypto).channelKey(await senderKey(me), index);
      const channelKeyHash = (await crypto).channelKeyHash(channelKey);
      const { data: channels } = await getChannels();
      if (!channels!.some((channel: { channelKeyHash: bigint }) => channel.channelKeyHash === BigInt(channelKeyHash))) {
        setStep("prove");
        await painted();
        const { proof } = (await crypto).prove(channelKey);
        setStep("send");
        const response = await fetch("/api/fixed-sender", {
          method: "POST",
          body: JSON.stringify({ type: "openChannel", channelKeyHash, proof }),
        });
        const { hash, error } = await response.json();
        if (error) throw new Error(error);
        setStep("confirm");
        if ((await publicClient!.waitForTransactionReceipt({ hash })).status !== "success") {
          throw new Error("The chain said no. Try again?");
        }
      }
      saveChannelKey(me, other, channelKey);
      setStep("open");
    } catch (e: any) {
      setError(e.shortMessage ?? e.message);
    }
  };

  /** Finds every Channel you opened from your signature alone (ADR-0002), and caches each Channel Key. */
  const restore = async (me: Address) => {
    const crypto = await loadCrypto();
    const key = await senderKey(me);
    const { data: users } = await getUsers({ throwOnError: true });
    const { data: channels } = await getChannels({ throwOnError: true });
    const hashes = new Set(channels!.map((channel: { channelKeyHash: bigint }) => channel.channelKeyHash));
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
