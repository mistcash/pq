import { useQuery } from "@tanstack/react-query";
import { type Hex, toHex } from "viem";
import { usePublicClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { loadCrypto } from "~~/utils/crypto";

/** A Channel's messages, decrypted in order, and sending the next one through the Fixed Sender. */
export const useMessages = (channelKey: Hex) => {
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });
  const publicClient = usePublicClient();
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["messages", channelKey],
    enabled: !!pqMsg,
    // Reads from Message Index 0 upward until a Message ID has nothing stored.
    queryFn: async () => {
      const crypto = await loadCrypto();
      const read: string[] = [];
      for (;;) {
        const i = read.length;
        const id = BigInt(crypto.messageId(channelKey, i));
        const [c1, c2] = (await pqMsg!.read.messages([id])) as readonly [bigint, bigint];
        if (!c1 && !c2) return read;
        read.push(crypto.decrypt(channelKey, i, toHex(c1), toHex(c2)));
      }
    },
  });

  /** Posts at the first Message Index with nothing stored, found by reading the Channel again. */
  const send = async (message: string) => {
    const index = (await refetch({ throwOnError: true })).data!.length;
    const crypto = await loadCrypto();
    const [ciphertext1, ciphertext2] = crypto.encrypt(channelKey, index, message);
    const response = await fetch("/api/fixed-sender", {
      method: "POST",
      body: JSON.stringify({ type: "post", messageId: crypto.messageId(channelKey, index), ciphertext1, ciphertext2 }),
    });
    const { hash, error } = await response.json();
    if (error) throw new Error(error);
    if ((await publicClient!.waitForTransactionReceipt({ hash })).status !== "success") {
      throw new Error("The chain said no. Try again?");
    }
    await refetch();
  };

  return { messages: data, refresh: refetch, refreshing: isFetching, send };
};
