import type { Hex } from "viem";

/** The Go crypto module (packages/circuits/cmd/wasm). All hashing happens there, never in JavaScript (ADR-0001). */
export type Crypto = {
  senderKey: (signature: Hex) => Hex;
  channelKey: (senderKey: Hex, userIndex: number) => Hex;
  channelKeyHash: (channelKey: Hex) => Hex;
  prove: (channelKey: Hex) => { proof: Hex; channelKeyHash: Hex };
};

let loading: Promise<Crypto> | undefined;

const bytes = async (path: string) => new Uint8Array(await (await fetch(path)).arrayBuffer());

const load = async (): Promise<Crypto> => {
  await new Promise((onload, onerror) =>
    document.head.append(
      Object.assign(document.createElement("script"), { src: "/circuits/wasm_exec.js", onload, onerror }),
    ),
  );
  const go = new (window as any).Go();
  const { instance } = await WebAssembly.instantiateStreaming(fetch("/circuits/pqmsg.wasm"), go.importObject);
  go.run(instance);
  const [ccs, pk] = await Promise.all([bytes("/circuits/openChannel.ccs"), bytes("/circuits/openChannel.pk")]);
  const call =
    (name: string) =>
    (...args: unknown[]) => {
      const result = (window as any).pqmsg[name](...args);
      if (result instanceof Error) throw result;
      return result;
    };
  return {
    senderKey: call("senderKey"),
    channelKey: call("channelKey"),
    channelKeyHash: call("channelKeyHash"),
    prove: channelKey => call("prove")(ccs, pk, channelKey),
  };
};

/** Loads the crypto module once per page. */
export const loadCrypto = () => (loading ??= load());
