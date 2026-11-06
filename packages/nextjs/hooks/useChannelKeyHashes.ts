import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/** Fetches the Channel Key Hash of every Channel on-chain, to look up whether a Channel is open. */
export const useChannelKeyHashes = () => {
  const { refetch } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getChannels" });
  return async () => {
    const { data: channels } = await refetch({ throwOnError: true });
    return new Set(channels!.map((channel: { channelKeyHash: bigint }) => channel.channelKeyHash));
  };
};
