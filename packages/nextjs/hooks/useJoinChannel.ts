import { useEffect, useState } from "react";
import { type Address, isHex, size } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChannelKeyHashes } from "~~/hooks/useChannelKeyHashes";
import { parseJoinLink, saveChannelKey } from "~~/utils/channels";
import { loadCrypto } from "~~/utils/crypto";
import { FriendlyError, friendlyMessage } from "~~/utils/friendly";

export type Joining = { from: Address; joined?: boolean; error?: string };

const NO_MATCH = "Hmm, that key doesn't open any chat. Maybe a bit got lost when copying?";

/** Joins the Channel someone opened to you, once its Channel Key matches a Channel on-chain. */
export const useJoinChannel = (me?: Address) => {
  const [joining, setJoining] = useState<Joining>();
  const { refetch: getUsers } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getUsers" });
  const channelKeyHashes = useChannelKeyHashes();

  const join = async (from: Address, channelKey: string) => {
    setJoining({ from });
    try {
      if (!isHex(channelKey) || size(channelKey) !== 32) throw new FriendlyError(NO_MATCH);
      const { data: users } = await getUsers({ throwOnError: true });
      if (!users!.includes(from))
        throw new FriendlyError("That link isn't from anyone on pqmsg. Maybe a bit got lost when copying?");
      const channelKeyHash = BigInt((await loadCrypto()).channelKeyHash(channelKey));
      if (!(await channelKeyHashes()).has(channelKeyHash)) throw new FriendlyError(NO_MATCH);
      saveChannelKey(from, me!, channelKey);
      setJoining({ from, joined: true });
    } catch (e) {
      setJoining({ from, error: friendlyMessage(e) });
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
