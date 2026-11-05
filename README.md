# pqmsg

Install matt pocock skills before starting.

we are building post quantum secure messaging layer for ethereum testnet.

Terms are defined in `GLOSSARY.md`; key decisions are in `docs/adr/`.

## PHASE 1 - registration and message sending

Set up with Scaffold-ETH 2 using Foundry (`npx create-eth@latest -s foundry`), plus a gnark circuit in Go. Scripts compile the circuit, run a dev-only Groth16 setup on BN254, export the Solidity verifier, and build a WASM prover for the frontend. Every hash is gnark's standard Poseidon2 (ADR-0001). It deploys to Sepolia, with anvil for local development.

The flow is,
1. Users connect their wallet and register a User Key (a random dummy u256 for now, used later for encryption).
2. Registered Users are shown in a list, and the sender picks a recipient.
3. The sender opens a Channel to them. Its Channel Key is H(Sender Key, recipient's User Index), and the Sender Key is derived from a wallet signature (ADR-0002). The circuit proves that the Channel Key hashes to the Channel Key Hash, which is stored for the Channel. The sender shares the Channel Key with the recipient out of band, and the recipient pastes it in.
4. To send a message, the sender derives the Message Key = H(Channel Key, Message Index) and the Message ID = H(Message Key, 0). The message's two 31-byte halves become the two Ciphertext Elements by adding H(Message Key, 1) and H(Message Key, 2) respectively (hash and add). In Phase 1 this happens outside the circuit.
5. The contract stores the two Ciphertext Elements as u256 values in a publicly readable hashmap keyed by Message ID. The recipient finds messages by checking Message IDs from Message Index 0 upward.

A Fixed Sender (a stand-in for a future relayer) submits Channel openings and messages, so they don't reveal who is talking. Registration comes from the user's own wallet.

Contract stores:
1. List of registered Users with their u256 User Key (dummy for now, will be used later for encryption).
2. Channels array: each Channel's Channel Key Hash and encrypted Channel Key (empty for now, will later let recipients find their Channels).
3. Messages: hashmap of Message ID to the two Ciphertext Elements.

## Design

Playful and polished, yet insanely simple, minimal and mobile friendly. It uses MIST.cash colors; fonts and other design details are free to change. Each User's profile image is generated from the hash of their address.
