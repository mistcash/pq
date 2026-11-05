import type { Hex } from "viem";

/** The Go crypto module (packages/circuits/cmd/wasm). All hashing happens there, never in JavaScript (ADR-0001). */
export type Crypto = {
  senderKey: (signature: Hex) => Hex;
  channelKey: (senderKey: Hex, userIndex: number) => Hex;
  channelKeyHash: (channelKey: Hex) => Hex;
  prove: (channelKey: Hex) => { proof: Hex; channelKeyHash: Hex };
  messageId: (channelKey: Hex, messageIndex: number) => Hex;
  /** Throws if the message is over 62 bytes. */
  encrypt: (channelKey: Hex, messageIndex: number, message: string) => [Hex, Hex];
  decrypt: (channelKey: Hex, messageIndex: number, ciphertext1: Hex, ciphertext2: Hex) => string;
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
    messageId: call("messageId"),
    encrypt: call("encrypt"),
    decrypt: call("decrypt"),
  };
};

/** Loads the crypto module once per page, trying again next time if it fails. */
export const loadCrypto = () =>
  (loading ??= load().catch(e => {
    loading = undefined;
    throw e;
  }));
