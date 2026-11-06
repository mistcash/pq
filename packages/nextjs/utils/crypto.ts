import type { Hex } from "viem";

/** The Go crypto module (packages/circuits/cmd/wasm). All hashing happens there, never in JavaScript (ADR-0001). */
export type Crypto = {
  senderKey: (signature: Hex, password: string) => Hex;
  channelKey: (senderKey: Hex, userIndex: number) => Hex;
  channelKeyHash: (channelKey: Hex) => Hex;
  /** The packed Kyber512 public key to register. */
  userKey: (senderKey: Hex) => Hex;
  /** Encrypts `channelKey` to `userKey` as the 37-element Encrypted Channel Key, and proves it. */
  prove: (userKey: Hex, channelKey: Hex) => { proof: Hex; channelKeyHash: Hex; encryptedChannelKey: Hex[] };
  /** Junk if the Channel isn't to you, so check its Channel Key Hash. */
  decryptChannelKey: (senderKey: Hex, encryptedChannelKey: Hex[]) => Hex;
  encryptSender: (channelKey: Hex, senderIndex: number) => Hex;
  /** The sender's User Index as hex; a huge number if junk. */
  decryptSender: (channelKey: Hex, encryptedSender: Hex) => Hex;
  messageKey: (channelKey: Hex, messageIndex: number) => Hex;
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
    userKey: call("userKey"),
    prove: (userKey, channelKey) => call("prove")(ccs, pk, userKey, channelKey),
    decryptChannelKey: call("decryptChannelKey"),
    encryptSender: call("encryptSender"),
    decryptSender: call("decryptSender"),
    messageKey: call("messageKey"),
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
