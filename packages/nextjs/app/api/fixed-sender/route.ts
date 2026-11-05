import { NextResponse } from "next/server";
import { type Hex, createWalletClient, http, isHex, publicActions, size } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

const chain = scaffoldConfig.targetNetworks[0];
// Anvil's account #1, used only on the local chain; the deployer and faucet use other anvil accounts.
const ANVIL_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const key = process.env.FIXED_SENDER_PRIVATE_KEY || (chain.id === hardhat.id ? ANVIL_KEY : undefined);

const is = (value: unknown, bytes: number): value is Hex => isHex(value) && size(value) === bytes;

/** Builds the contract call for a typed open-Channel or post request, and for nothing else. */
const callFor = ({ type, channelKeyHash, proof, messageId, ciphertext1, ciphertext2 }: any) => {
  if (type === "openChannel" && is(channelKeyHash, 32) && is(proof, 256)) {
    return { functionName: "openChannel", args: [BigInt(channelKeyHash), "0x", proof] };
  }
  if (type === "post" && is(messageId, 32) && is(ciphertext1, 32) && is(ciphertext2, 32)) {
    return { functionName: "post", args: [BigInt(messageId), BigInt(ciphertext1), BigInt(ciphertext2)] };
  }
};

/** The Fixed Sender: submits typed requests so users pay no gas and keep their address off-chain. */
export async function POST(request: Request) {
  const call = callFor(await request.json());
  if (!call) return NextResponse.json({ error: "Expected an open-Channel or post request" }, { status: 400 });
  const pqMsg = contracts?.[chain.id]?.PqMsg;
  const unset = (reason: string) => NextResponse.json({ error: `Sending isn't set up: ${reason}.` }, { status: 500 });
  if (!key) return unset("this server has no FIXED_SENDER_PRIVATE_KEY");
  if (!pqMsg) return unset(`PqMsg isn't deployed on ${chain.name}`);

  const client = createWalletClient({
    account: privateKeyToAccount(key as Hex),
    chain,
    transport: http(process.env.FIXED_SENDER_RPC_URL || getAlchemyHttpUrl(chain.id)),
  }).extend(publicActions);
  try {
    // Simulate first: a bad proof would otherwise burn all the gas it's given.
    const { request: tx } = await client.simulateContract({ address: pqMsg.address, abi: pqMsg.abi, ...call });
    return NextResponse.json({ hash: await client.writeContract(tx) });
  } catch (e: any) {
    return NextResponse.json({ error: e.shortMessage ?? String(e) }, { status: 400 });
  }
}
