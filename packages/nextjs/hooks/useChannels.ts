import type { Hex } from "viem";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { fetchChannels } from "~~/utils/arkiv";

/** Fetches every Channel, its hash from PqMsg and its data from Arkiv, to look one up or find the ones opened to you. */
export const useChannels = () => {
  const { refetch } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getChannels" });
  const { data: pqMsg } = useScaffoldContract({ contractName: "PqMsg" });
  return async () => fetchChannels(pqMsg!.address, (await refetch({ throwOnError: true })).data as readonly Hex[]);
};
