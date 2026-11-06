import { NextResponse } from "next/server";
import { ExpirationTime, createWalletClient as createArkivClient } from "@arkiv-network/sdk";
import { and, eq } from "@arkiv-network/sdk/query";
import {
  type Address,
  type Hex,
  createWalletClient,
  hexToBytes,
  http,
  isAddress,
  isHex,
  keccak256,
  publicActions,
  size,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { ChannelEntity, UserKeyEntity, arkiv, arkivChain, encodeChannel, fetchUserKey } from "~~/utils/arkiv";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

const chain = scaffoldConfig.targetNetworks[0];
// Anvil's account #1, used only on the local chain; the deployer and faucet use other anvil accounts.
const ANVIL_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const key = process.env.FIXED_SENDER_PRIVATE_KEY || (chain.id === hardhat.id ? ANVIL_KEY : undefined);
// The Fixed Sender writes to Arkiv too (ADR-0005), from its own key unless this one is set.
const arkivKey = process.env.ARKIV_PRIVATE_KEY || key;

const isHexOfSize = (value: unknown, bytes: number): value is Hex => isHex(value) && size(value) === bytes;

/** Builds the contract call for a typed open-Channel, post or User Key request, and for nothing else. */
const callFor = ({
  type,
  user,
  userKey,
  channelKeyHash,
  encryptedChannelKey,
  encryptedSender,
  proof,
  messageId,
  ciphertext1,
  ciphertext2,
}: any) => {
  if (
    type === "openChannel" &&
    isHexOfSize(channelKeyHash, 32) &&
    Array.isArray(encryptedChannelKey) &&
    encryptedChannelKey.length === 37 &&
    encryptedChannelKey.every(element => isHexOfSize(element, 32)) &&
    isHexOfSize(encryptedSender, 32) &&
    // Any length: it changes with the circuit, and simulating checks the proof anyway.
    isHex(proof)
  ) {
    return {
      functionName: "openChannel",
      args: [BigInt(channelKeyHash), encryptedChannelKey.map(BigInt), BigInt(encryptedSender), proof],
    };
  }
  if (type === "post" && isHexOfSize(messageId, 32) && isHexOfSize(ciphertext1, 32) && isHexOfSize(ciphertext2, 32)) {
    return { functionName: "post", args: [BigInt(messageId), BigInt(ciphertext1), BigInt(ciphertext2)] };
  }
  // Stores a registered User Key on Arkiv; it sends nothing to PqMsg.
  if (type === "userKey" && isAddress(user) && isHexOfSize(userKey, 800)) {
    return { functionName: "userKeyHashes", args: [user], userKey };
  }
};

/** The Fixed Sender: submits typed requests so users pay no gas and keep their address off-chain. */
export async function POST(request: Request) {
  const call = callFor(await request.json().catch(() => ({})));
  if (!call) return NextResponse.json({ error: "That isn't something we can send." }, { status: 400 });
  const pqMsg = contracts?.[chain.id]?.PqMsg;
  // Details stay in the server log; people only see plain words.
  const unset = (reason: string) => {
    console.error(`Fixed Sender isn't set up: ${reason}.`);
    return NextResponse.json({ error: "Sending isn't ready yet. Try again later." }, { status: 500 });
  };
  if (!key || !arkivKey) return unset("this server has no FIXED_SENDER_PRIVATE_KEY");
  if (!pqMsg) return unset(`PqMsg isn't deployed on ${chain.name}`);
  const arkivWallet = createArkivClient({
    account: privateKeyToAccount(arkivKey as Hex),
    chain: arkivChain,
    transport: http(),
  });
  const pqmsg = pqMsg.address.toLowerCase();
  // Arkiv's longest lifetime, 7,884,000 two-second blocks.
  const expiration = ExpirationTime.fromDays(182);

  const client = createWalletClient({
    account: privateKeyToAccount(key as Hex),
    chain,
    transport: http(process.env.FIXED_SENDER_RPC_URL || getAlchemyHttpUrl(chain.id)),
  }).extend(publicActions);
  try {
    if (call.functionName === "userKeyHashes") {
      // Only a key whose hash its User registered on PqMsg, and only once.
      const hash = await client.readContract({ address: pqMsg.address, abi: pqMsg.abi, ...call });
      const userKey = call.userKey!;
      if (hash !== keccak256(userKey)) return NextResponse.json({ error: "That isn't your key." }, { status: 400 });
      if (await fetchUserKey(pqMsg.address, hash)) return NextResponse.json({});
      const user = (call.args[0] as Address).toLowerCase();
      const values = { pqmsg, hash, user, data: hexToBytes(userKey) };
      const { entityKey } = await arkivWallet.createEntity(UserKeyEntity, values, { expiration });
      return NextResponse.json({ entityKey });
    }
    let entityKey: Hex | undefined;
    if (call.functionName === "openChannel") {
      // A proof can be replayed, so refuse a Channel that's already open rather than pay for it again.
      const channelKeyHash = toHex(call.args[0] as bigint, { size: 32 });
      const hashes = await client.readContract({ address: pqMsg.address, abi: pqMsg.abi, functionName: "getChannels" });
      const { entities } = await arkiv
        .select({ hash: true })
        .from(ChannelEntity)
        .where(and(eq("pqmsg", pqmsg), eq("channelKeyHash", channelKeyHash)))
        .fetch();
      if (entities.some(entity => (hashes as readonly Hex[]).includes(entity.hash.value as Hex))) {
        return NextResponse.json({ error: "That chat is already open." }, { status: 409 });
      }
    }
    // Simulate first: a bad proof would otherwise burn all the gas it's given.
    const { request: tx } = await client.simulateContract({ address: pqMsg.address, abi: pqMsg.abi, ...call });
    if (call.functionName === "openChannel") {
      // Onto Arkiv before Ethereum, so PqMsg never holds a hash whose Channel nobody can fetch.
      const [channelKeyHash, encryptedChannelKey, encryptedSender] = call.args as [bigint, bigint[], bigint];
      const data = encodeChannel({ channelKeyHash, encryptedChannelKey, encryptedSender });
      const values = {
        pqmsg,
        hash: keccak256(data),
        channelKeyHash: toHex(channelKeyHash, { size: 32 }),
        data: hexToBytes(data),
      };
      ({ entityKey } = await arkivWallet.createEntity(ChannelEntity, values, { expiration }));
    }
    return NextResponse.json({ hash: await client.writeContract(tx), entityKey });
  } catch (e) {
    console.error("Fixed Sender:", e);
    return NextResponse.json({ error: "That didn't go through. Try again?" }, { status: 400 });
  }
}
