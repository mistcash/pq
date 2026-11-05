import { useEffect, useState } from "react";
import { type Address, isHex, size } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { parseJoinLink, saveChannelKey } from "~~/utils/channels";
import { loadCrypto } from "~~/utils/crypto";

export type Joining = { from: Address; joined?: boolean; error?: string };

const NO_MATCH = "Hmm, that key doesn't open any chat. Maybe a bit got lost when copying?";

/** Joins the Channel someone opened to you, once its Channel Key matches a Channel on-chain. */
export const useJoinChannel = (me?: Address) => {
  const [joining, setJoining] = useState<Joining>();
  const { refetch: getChannels } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getChannels" });

  const join = async (from: Address, channelKey: string) => {
    setJoining({ from });
    try {
      if (!isHex(channelKey) || size(channelKey) !== 32) throw new Error(NO_MATCH);
      const channelKeyHash = BigInt((await loadCrypto()).channelKeyHash(channelKey));
      const { data: channels } = await getChannels({ throwOnError: true });
      if (!channels!.some((channel: { channelKeyHash: bigint }) => channel.channelKeyHash === channelKeyHash)) {
        throw new Error(NO_MATCH);
      }
      saveChannelKey(from, me!, channelKey);
      setJoining({ from, joined: true });
    } catch (e: any) {
      setJoining({ from, error: e.shortMessage ?? e.message });
    }
  };

  // A join link waits in the URL until you're registered. Opening one in an open tab only changes the fragment.
  useEffect(() => {
    if (!me) return;
    const joinFromLink = () => {
      const link = parseJoinLink(location.hash);
      if (!link) return;
      history.replaceState(null, "", location.pathname);
      join(link.from, link.channelKey);
    };
    joinFromLink();
    addEventListener("hashchange", joinFromLink);
    return () => removeEventListener("hashchange", joinFromLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  return { joining, join, leave: () => setJoining(undefined) };
};
