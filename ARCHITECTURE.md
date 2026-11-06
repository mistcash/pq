# Architecture

Set up with Scaffold-ETH 2 using Foundry (`npx create-eth@latest -s foundry`), plus a gnark circuit in Go. Scripts compile the circuit, run a dev-only Groth16 setup on BN254, export the Solidity verifier, and build a WASM prover for the frontend. Every hash is gnark's standard Poseidon2 (ADR-0001). It deploys to Sepolia, with anvil for local development.

| Job | Primitive | Code |
| --- | --- | --- |
| Carry the Channel Key to its recipient | Kyber512 CPA-PKE (NIST level 1), with the ciphertext left uncompressed so the circuit can check it | `packages/circuits/kyber.go`, `native/` |
| Prove the Encrypted Channel Key is well formed | Groth16 on BN254 (gnark v0.16), checked on-chain by `Verifier.sol` | `packages/circuits/circuits.go`, `circuit/` |
| Every hash, key derivation and message pad | gnark's Poseidon2 on BN254, in Merkle-Damgård mode | `packages/circuits/circuits.go` |
| Encrypt a message | Each 31-byte half plus a Poseidon2 pad, in BN254's scalar field | `circuits.Encrypt` |
| Root secret | Poseidon2 of a passkey's WebAuthn PRF output on `pqmsg: derive Sender Key v2` | `packages/nextjs/utils/passkey.ts` |

The browser runs the same Go code, compiled to WASM (`packages/circuits/cmd/wasm`), so each hash and each Kyber step has one implementation, natively, in the circuit and in the browser. Kyber comes from Cloudflare's CIRCL, through the `mistcash/circl` fork (v1.6.4-e.1), which exports Kyber512's internal polynomial math as `pke/kyber/kyber512/math` for the circuit and its witness.

## Keys

Every key comes from one passkey (ADR-0004). H is Poseidon2, and `tag` is 2⁶⁴, an input no User Index or Message Index can take.

```
passkey's PRF output on "pqmsg: derive Sender Key v2"
└─ Sender Key = H(PRF output)                           kept in memory, never sent
   ├─ User Key = Kyber512 key pair seeded by H(Sender Key, tag)
   │             its 800-byte public key is registered on-chain
   └─ Channel Key = H(Sender Key, recipient's User Index)
      ├─ Channel Key Hash = H(Channel Key)              public
      ├─ Encrypted Sender = sender's User Index + H(Channel Key, tag)
      └─ Message Key = H(Channel Key, Message Index)
         ├─ Message ID = H(Message Key, 0)              public
         └─ pads H(Message Key, 1) and H(Message Key, 2)
```

There are no ephemeral keys. The one random input is the Kyber encryption noise: 32 fresh bytes from `crypto.getRandomValues` for each Channel opening.

## What the opening proof shows

`openChannel` checks a Groth16 proof against 38 public inputs: the Channel Key Hash and the 37 elements of the Encrypted Channel Key. The proof shows that its maker knows a Channel Key that hashes to the Channel Key Hash, and that the Encrypted Channel Key is a Kyber512 encryption of it with in-range noise.

It doesn't show whose key it was encrypted to. The Kyber public key is a private input (ADR-0003), so the chain never learns the recipient, and a sender who encrypts to the wrong key only breaks their own Channel. The Encrypted Sender is outside the proof, so it doesn't prove who opened the Channel either.

## Code map

| Path | What's there |
| --- | --- |
| `packages/circuits` | The circuit (`circuits.go`, `circuit/`), Kyber in plain Go (`kyber.go`, `native/`), the browser module (`cmd/wasm`) and the setup (`cmd/artifacts`) |
| `packages/foundry` | `PqMsg.sol`, and `Verifier.sol`, generated from the circuit |
| `packages/nextjs` | The app; `public/circuits/` holds `pqmsg.wasm`, the prover worker, the proving key and gnark's WebGPU runtime |
