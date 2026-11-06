import { type Address, type Hex, bytesToHex, toBytes } from "viem";
import { FriendlyError } from "~~/utils/friendly";

/** What every pqmsg passkey's PRF turns into a Sender Key's secret (ADR-0004). Changing it orphans every User. */
const SALT = new TextEncoder().encode("pqmsg: derive Sender Key v2");

const UNSUPPORTED =
  "This browser or passkey manager can't make the kind of passkey pqmsg needs. Try an up-to-date Chrome or Safari.";

/** Runs a passkey prompt, turning a cancelled or timed-out one into plain words. */
const prompt = async (run: () => Promise<Credential | null>) => {
  if (!window.PublicKeyCredential) throw new FriendlyError(UNSUPPORTED);
  try {
    return (await run()) as PublicKeyCredential | null;
  } catch (e) {
    if (e instanceof DOMException && e.name === "NotAllowedError") {
      throw new FriendlyError("Your passkey didn't go through. Try again?");
    }
    throw e;
  }
};

const challenge = () => crypto.getRandomValues(new Uint8Array(32));

/** Your passkey's 32-byte PRF output, after a tap. `ids` limits which passkeys may answer. */
export const passkeyOutput = async (ids?: BufferSource[]): Promise<Hex> => {
  const credential = await prompt(() =>
    navigator.credentials.get({
      publicKey: {
        challenge: challenge(),
        allowCredentials: ids?.map(id => ({ type: "public-key", id })),
        userVerification: "required",
        extensions: { prf: { eval: { first: SALT } } },
      },
    }),
  );
  const first = credential?.getClientExtensionResults().prf?.results?.first;
  if (!first) throw new FriendlyError(UNSUPPORTED);
  return bytesToHex(new Uint8Array(first as ArrayBuffer));
};

/** Makes a passkey named after this wallet, and gives its PRF output. */
export const createPasskey = async (me: Address): Promise<Hex> => {
  const credential = await prompt(() =>
    navigator.credentials.create({
      publicKey: {
        rp: { name: "pqmsg" },
        user: { id: toBytes(me), name: me, displayName: `pqmsg ${me.slice(0, 6)}…${me.slice(-4)}` },
        challenge: challenge(),
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        extensions: { prf: { eval: { first: SALT } } },
      },
    }),
  );
  const prf = credential?.getClientExtensionResults().prf;
  if (!credential || !prf?.enabled) throw new FriendlyError(UNSUPPORTED);
  const first = prf.results?.first;
  // Some passkeys only answer PRF when you sign in with them, so ask that one.
  return first ? bytesToHex(new Uint8Array(first as ArrayBuffer)) : passkeyOutput([credential.rawId]);
};
