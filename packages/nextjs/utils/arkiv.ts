import { createPublicClient } from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { and, eq } from "@arkiv-network/sdk/query";
import { bytes, defineSchema, str } from "@arkiv-network/sdk/schema";
import { type Address, type Hex, decodeAbiParameters, encodeAbiParameters, http, keccak256 } from "viem";

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

const decodeChannel = (data: Hex): Channel => {
  const [channelKeyHash, encryptedChannelKey, encryptedSender] = decodeAbiParameters(CHANNEL, data);
  return { channelKeyHash, encryptedChannelKey, encryptedSender };
};

/** Arkiv's own key for each entity, so the app can link it. */
export const arkivEntityUrl = (entityKey: Hex) => `${arkivChain.blockExplorers.default.url}/entity/${entityKey}`;

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

/** Every Channel from Arkiv that hashes to one of `hashes`, from PqMsg, in their order. */
export const fetchChannels = async (pqmsg: Address, hashes: readonly Hex[]) => {
  const found = new Map<Hex, Channel>();
  for (let offset = 0; ; offset += 100) {
    const { entities } = await arkiv
      .select({ data: true })
      .from(ChannelEntity)
      .where(eq("pqmsg", pqmsg.toLowerCase()))
      .limit(100)
      .offset(offset)
      .fetch();
    for (const { data } of entities) found.set(keccak256(data.value as Hex), decodeChannel(data.value as Hex));
    if (entities.length < 100) break;
  }
  return hashes.flatMap(hash => found.get(hash) ?? []);
};
