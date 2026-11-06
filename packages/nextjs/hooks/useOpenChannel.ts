import { useState } from "react";
import { type Address, type Hex, toHex } from "viem";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChannels } from "~~/hooks/useChannels";
import { useFixedSender } from "~~/hooks/useFixedSender";
import { useSenderKey } from "~~/hooks/useSenderKey";
import { saveChannelKey } from "~~/utils/channels";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError, friendlyMessage } from "~~/utils/friendly";

export type OpenStep = "start" | "passkey" | "prove" | "send" | "confirm" | "open";

/** Lets the current step render before proving blocks the page. */
const painted = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));

/** Opens a Channel to another User through the Fixed Sender, or finds the one already open. */
export const useOpenChannel = () => {
  const [step, setStep] = useState<OpenStep>();
  const [error, setError] = useState<string>();
  const [restored, setRestored] = useState<number>();
  const [tx, setTx] = useState<Hex>();
  const { refetch: getUsers } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getUsers" });
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });
  const getChannels = useChannels();
  const fixedSender = useFixedSender();
  const { unlock } = useSenderKey(setStep);

  const open = async (me: Address, other: Address) => {
    setStep("start");
    setError(undefined);
    try {
      // Before anything else, while the tap still counts: Safari only shows passkey prompts straight after one.
      const senderKey = await unlock(me);
      const crypto = loadCrypto();
      const { data: users } = await getUsers({ throwOnError: true });
      const index = users!.indexOf(other);
      if (index < 0) throw new FriendlyError("They haven't joined pqmsg yet. Ask them to join first!");
      const channelKey = (await crypto).channelKey(senderKey, index);
      const channelKeyHash = (await crypto).channelKeyHash(channelKey);
      if (!(await getChannels()).some(channel => channel.channelKeyHash === BigInt(channelKeyHash))) {
        const userKey = (await pqMsg!.read.userKeys([other])) as Hex;
        setStep("prove");
        await painted();
        const { proof, encryptedChannelKey } = await (await crypto).prove(userKey, channelKey);
        // Tells them who opened it, readable only with the Channel Key.
        const encryptedSender = (await crypto).encryptSender(channelKey, users!.indexOf(me));
        setStep("send");
        const hash = await fixedSender(
          { type: "openChannel", channelKeyHash, encryptedChannelKey, encryptedSender, proof },
          () => setStep("confirm"),
        );
        setTx(hash);
      }
      saveChannelKey(me, other, channelKey);
      setStep("open");
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  /** Finds every Channel from or to you with one passkey tap (ADR-0004), and caches each Channel Key. */
  const restore = async (me: Address) => {
    setStep("start");
    const key = await unlock(me);
    const crypto = await loadCrypto();
    setStep("prove");
    const { data: users } = await getUsers({ throwOnError: true });
    const channels = await getChannels();
    let found = 0;
    users!.forEach((user: Address, j: number) => {
      const channelKey = crypto.channelKey(key, j);
      const channelKeyHash = BigInt(crypto.channelKeyHash(channelKey));
      if (!channels.some(channel => channel.channelKeyHash === channelKeyHash)) return;
      saveChannelKey(me, user, channelKey);
      found++;
    });
    // Your key decrypts every Channel's Encrypted Channel Key, but only one opened to you gives back its Channel Key.
    channels.forEach(channel => {
      const channelKey = crypto.decryptChannelKey(
        key,
        channel.encryptedChannelKey.map(x => toHex(x)),
      );
      if (BigInt(crypto.channelKeyHash(channelKey)) !== channel.channelKeyHash) return;
      const from = users![Number(crypto.decryptSender(channelKey, toHex(channel.encryptedSender)))];
      if (!from) return;
      saveChannelKey(from, me, channelKey);
      found++;
    });
    setRestored(found);
  };

  return { step, error, open, tx, restored, restore };
};
