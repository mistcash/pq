import type { AnonRpcWorker } from "@anon-rpc/browser-harness";
import { type PublicClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

/** Nox, an Anon-RPC mixnet. Its specifier contract, on Sepolia, pins the hash of its worker's code. */
const NOX = "0x35133267A8F7EC35046a83DCA0f4Ca8A6e1b7A9A";
/** Nox starts in about 3 s, but retries for ever when it can't connect. A read takes about 1 s. */
const START_MS = 10_000;
const READ_MS = 15_000;

const chain = scaffoldConfig.targetNetworks[0];
/** Nox's exit nodes reach it over TLS. There's none on anvil, which they can't reach. */
const rpcUrl = getAlchemyHttpUrl(chain.id);

let nox: Promise<AnonRpcWorker | undefined> | undefined;

/** Starts Nox once per page, except on anvil. It never throws; after a failure, the next call starts afresh. */
export const startAnonRpc = () => {
  if (!rpcUrl) return;
  return (nox ??= import("@anon-rpc/browser-harness")
    .then(({ AnonRpcWorker }) => {
      // Everyone reads Nox's specifier, so the regular RPC learns nothing from it.
      const sepoliaClient = createPublicClient({ chain: sepolia, transport: http(getAlchemyHttpUrl(sepolia.id)) });
      const worker = new AnonRpcWorker({
        address: NOX,
        preExisting: { rpcProvider: { request: args => sepoliaClient.request(args as never) } },
      });
      worker.ready.catch(() => {
        nox = undefined;
        worker.close();
      });
      return worker;
    })
    .catch(e => {
      nox = undefined;
      console.warn("Anon-RPC didn't load:", e);
      return undefined;
    }));
};

const timeout = (ms: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Anon-RPC took over ${ms} ms`)), ms));

/** `read` through Anon-RPC, so the RPC server can't tell who asked. Undefined if Anon-RPC is off, slow or fails. */
export const anonRead = async <T>(read: (client: PublicClient) => Promise<T>) => {
  const starting = startAnonRpc();
  if (!starting) return;
  try {
    const ready = starting.then(async worker => {
      await worker?.ready;
      return worker;
    });
    const worker = await Promise.race([ready, timeout(START_MS)]);
    if (!worker) return;
    const transport = http(rpcUrl, { fetchFn: worker.fetch, timeout: READ_MS, retryCount: 0 });
    return await read(createPublicClient({ chain, transport }));
  } catch (e) {
    console.warn("Anon-RPC failed:", e);
  }
};
