import { createPublicClient } from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { and, eq } from "@arkiv-network/sdk/query";
import { bytes, defineSchema, str } from "@arkiv-network/sdk/schema";
import { type Address, type Hex, encodeAbiParameters, http, keccak256 } from "viem";

/** Rabdi, Arkiv's testnet. An access key lifts the public endpoint's rate limit. */
export const arkivChain = rabdi({ accessKey: process.env.NEXT_PUBLIC_ARKIV_ACCESS_KEY ?? "" });
export const arkiv = createPublicClient({ chain: arkivChain, transport: http() });

/** A User Key, stored whole under its keccak256, which PqMsg keeps (ADR-0005). */
export const UserKeyEntity = defineSchema("pqmsg.userKey", {
  pqmsg: str().indexed(),
  hash: str().indexed(),
  user: str().indexed(),
  data: bytes(),
});

/** A Channel, abi.encode(channelKeyHash, encryptedChannelKey, encryptedSender), stored whole under its keccak256. */
export const ChannelEntity = defineSchema("pqmsg.channel", {
  pqmsg: str().indexed(),
  hash: str().indexed(),
  channelKeyHash: str().indexed(),
  data: bytes(),
});

export type Channel = { channelKeyHash: bigint; encryptedChannelKey: readonly bigint[]; encryptedSender: bigint };

const CHANNEL = [{ type: "uint256" }, { type: "uint256[37]" }, { type: "uint256" }] as const;

export const encodeChannel = ({ channelKeyHash, encryptedChannelKey, encryptedSender }: Channel) =>
  encodeAbiParameters(CHANNEL, [channelKeyHash, encryptedChannelKey as never, encryptedSender]);

/** The User Key whose keccak256 is `hash`, from Arkiv; undefined if none hashes to it. */
export const fetchUserKey = async (pqmsg: Address, hash: Hex) => {
  const { entities } = await arkiv
    .select({ data: true })
    .from(UserKeyEntity)
    .where(and(eq("pqmsg", pqmsg.toLowerCase()), eq("hash", hash)))
    .limit(10)
    .fetch();
  // Anyone can write to Arkiv, so only data that hashes to Ethereum's hash counts.
  return entities.map(entity => entity.data.value as Hex).find(data => keccak256(data) === hash);
};
