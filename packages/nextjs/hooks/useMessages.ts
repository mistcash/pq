import { useQuery } from "@tanstack/react-query";
import { type Hex, toHex } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useFixedSender } from "~~/hooks/useFixedSender";
import { recordStep, recordTx } from "~~/services/store/deepDive";
import { loadCrypto } from "~~/utils/crypto";

/** Where this browser keeps the hash of a message it sent, to link it on the block explorer. */
const txStorageKey = (messageId: Hex) => `pqmsg:tx:${messageId}`;

/** A Channel's messages, decrypted in order, and sending the next one through the Fixed Sender. */
export const useMessages = (channelKey: Hex) => {
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });
  const fixedSender = useFixedSender();
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["messages", channelKey],
    enabled: !!pqMsg,
    // Reads from Message Index 0 upward until a Message ID has nothing stored.
    queryFn: async () => {
      const crypto = await loadCrypto();
      const read: { text: string; tx?: string }[] = [];
      for (;;) {
        const i = read.length;
        const id = crypto.messageId(channelKey, i);
        const [c1, c2] = (await pqMsg!.read.messages([BigInt(id)])) as readonly [bigint, bigint];
        if (!c1 && !c2) return read;
        read.push({
          text: crypto.decrypt(channelKey, i, toHex(c1), toHex(c2)),
          tx: localStorage.getItem(txStorageKey(id)) ?? undefined,
        });
      }
    },
  });

  /** Posts at the first Message Index with nothing stored, found by reading the Channel again. */
  const send = async (message: string) => {
    const index = (await refetch({ throwOnError: true })).data!.length;
    const crypto = await loadCrypto();
    const [ciphertext1, ciphertext2] = crypto.encrypt(channelKey, index, message);
    const messageId = crypto.messageId(channelKey, index);
    const messageKey = crypto.messageKey(channelKey, index);
    recordStep("send", { messageIndex: String(index), messageKey, messageId, ciphertext1, ciphertext2 });
    const hash = await fixedSender({ type: "post", messageId, ciphertext1, ciphertext2 });
    localStorage.setItem(txStorageKey(messageId), hash);
    recordTx("send", hash);
    await refetch();
  };

  return { messages: data, refresh: refetch, refreshing: isFetching, send };
};
