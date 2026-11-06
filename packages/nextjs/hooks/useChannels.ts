import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export type Channel = { channelKeyHash: bigint; encryptedChannelKey: readonly bigint[]; encryptedSender: bigint };

/** Fetches every Channel on-chain, to look up whether a Channel is open or find the ones opened to you. */
export const useChannels = () => {
  const { refetch } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getChannels" });
  return async () => (await refetch({ throwOnError: true })).data as readonly Channel[];
};
