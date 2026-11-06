# Security considerations

pq aims to let only a Channel's two ends read its messages, and to keep who talks to whom off the chain: the recipient is a private input to the proof, the sender is encrypted, and the Fixed Sender submits both. It's a testnet prototype and hasn't been audited. This is where it falls short today.

## What is post-quantum, and what isn't yet

| Part | Rests on | Against a quantum attacker | If it breaks |
| --- | --- | --- | --- |
| Carrying Channel Keys | Module-LWE (Kyber512, NIST level 1) | Holds | That Channel's messages |
| Hashes, Message Keys and pads | Poseidon2 | Holds; Grover's speed-up on hashes is only quadratic | Messages |
| The opening proof's soundness | Pairings on BN254 (Groth16) | Breaks | Forged Channel openings: junk, not leaks. Groth16 is perfectly zero-knowledge, so proofs still hide the recipient. |
| The Sender Key | A passkey's PRF secret, through HMAC-SHA-256 | Holds | Everything the User sent and received |
| Who can replace a User Key | The wallet's secp256k1 key, through `register` | Breaks | Channels opened to the User after the swap |

**The wallet is the weak link.** The Sender Key comes from a passkey's PRF output (ADR-0004), which no public key reveals, so harvest now, decrypt later can't recover it from chain data, and past Channels stay safe. But `register` still overwrites, and only the wallet authorizes it. Registering reveals the wallet's public key, so a quantum attacker who recovers its private key can register their own User Key and read Channels opened to that User afterwards. The User would notice, since their passkey stops unlocking. A one-shot `register` would close this, but then a lost passkey would retire the address. A synced passkey is also only as safe as its provider's sync, which we haven't seen documented as post-quantum.

## Keys, and where they live

- **No ephemeral keys.** Every key comes from the Sender Key, by design (ADR-0002), so there's no forward secrecy and no re-keying. A leaked Sender Key exposes every Channel its User opened and every Channel opened to them, since their User Key comes from it too.
- **Passkeys are tied to pq's domain.** Another site can't ask yours for its PRF output. But pq on a new domain would need new passkeys, and losing yours loses every Channel (ADR-0004).
- **Sender Keys stay in memory** for the page's lifetime and are never sent anywhere.
- **Channel Keys are cached unencrypted in `localStorage`**, so anyone who can run script in this browser profile (an XSS bug, an extension) or open it can read your chats. **Find my chats** rebuilds them from one passkey tap, so they could live in memory instead. The app doesn't set a Content Security Policy yet.

## Known gaps in the protocol

- **Kyber512 CPA-PKE, not ML-KEM.** It's NIST level 1 and only CPA-secure, without the Fujisaki-Okamoto transform. User Keys never change, and the proof doesn't tie a ciphertext to a registered User Key, so anyone can post crafted ciphertexts to a User. If a User's behaviour shows whether one decrypted to a valid Channel, for example by replying, that's the plaintext-checking oracle that known key-recovery attacks on CPA Kyber need. Each try costs a Channel opening, at well over 1M gas.
- **Messages aren't authenticated.** A Ciphertext Element is the message half plus a pad, so changing it shifts the plaintext predictably. Someone watching the mempool can front-run a `post` with altered Ciphertext Elements under the same Message ID: the recipient reads the altered message, and the real one reverts.
- **The trusted setup is single-party.** `cmd/artifacts` runs a dev-only Groth16 setup, and whoever runs it could keep its secret randomness and forge proofs. That allows junk Channel openings but exposes no messages. A multi-party ceremony should replace it before mainnet.
- **The contract doesn't refuse repeats.** The Fixed Sender refuses a Channel that's already open, but `openChannel` doesn't, so anyone can replay a proof. `getChannels` returns every Channel, and each User trial-decrypts all of them.

## Side channels, memory and metadata

- **No side-channel guarantees.** The crypto runs as Go compiled to WASM, and nothing in a browser promises constant time. CIRCL's Kyber aims to be constant-time in native code; we don't claim that survives WASM.
- **No memory wiping.** Keys cross between JavaScript and Go as strings, which can't be zeroed, and stay on Go's heap until it's reclaimed. On the GPU path, the witness sits in GPU buffers.
- **The proving key is read without subgroup checks** (`UnsafeReadFrom`), which saves 18 s. It's served from the same origin as `pqmsg.wasm`, so anyone able to swap it could swap the prover too.
- **Metadata.** Registering is public. The RPC provider sees which Message IDs a browser polls, and the Fixed Sender sees the IP address behind each Channel opening and message.
