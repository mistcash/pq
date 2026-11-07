# pq

[![Lint](https://github.com/mistcash/pq/actions/workflows/lint.yaml/badge.svg)](https://github.com/mistcash/pq/actions/workflows/lint.yaml)
[![Licence: MIT](https://img.shields.io/badge/licence-MIT-blue)](LICENCE)
[![Network: Sepolia](https://img.shields.io/badge/network-Sepolia-627EEA?logo=ethereum)](DEPLOY.md#sepolia-deployment)
![Key exchange: Kyber512](https://img.shields.io/badge/key%20exchange-Kyber512-6f42c1)
![Proof: Groth16 on BN254](https://img.shields.io/badge/proof-Groth16%20on%20BN254-0e8a16)
![Status: unaudited prototype](https://img.shields.io/badge/status-unaudited%20prototype-orange)

Scalable, post-quantum cryptographic messaging for private payments and peer coordination.

pq stores every message publicly on-chain, yet only the two ends of a conversation can read it, and the chain doesn't show who is talking to whom. Each conversation's key travels encrypted with Kyber512, a lattice-based scheme designed to resist quantum computers, and a zero-knowledge proof made in your browser shows it was encrypted correctly. Every key comes from one passkey, made when you join. User Keys and Channels live on [Arkiv](https://arkiv.network), and Ethereum keeps only their keccak256 hashes, which cut the gas to register by 88% and to open a Channel by 83% (see [Arkiv](#arkiv)).

**Why it matters.** Whatever goes on a public chain stays there forever. Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists. pq is a working testbed for private messaging on a public chain without that expiry date, and it's explicit about the parts that aren't post-quantum yet (see [SECURITY.md](SECURITY.md)).

Status: Phase 1, on the Sepolia testnet. A research prototype, not audited.

## How it works

1. **Join.** You make a passkey. It gives you a Sender Key, and from that a Kyber512 User Key, which your wallet registers on-chain.
2. **Open a Channel.** Pick a User. Your browser derives a Channel Key for them, encrypts it to their User Key, and proves in zero knowledge that it knows the Channel Key and that the Encrypted Channel Key is well formed, without revealing the recipient.
3. **Send.** Each message, up to 62 bytes, is padded with hashes of its Message Key and stored under a Message ID that only the Channel's two ends can work out.
4. **Read.** The recipient finds Channels opened to them by trial-decrypting every Encrypted Channel Key, then reads messages by Message ID from Message Index 0 upward.

A Fixed Sender submits Channel openings and messages, so the chain shows only it calling PqMsg. The full protocol is in [ARCHITECTURE.md](ARCHITECTURE.md).

Deep dive mode (🤿 in the header) explains each step as it happens: what ran in the browser, the circuit and on-chain, the values involved (secrets hidden until tapped), and what to watch out for. It's a sidebar on desktop and sits below the page on phones.

## By the numbers

| | |
| --- | --- |
| 🔑 User Key | 800 bytes, a Kyber512 public key |
| ✉️ Message | up to 62 bytes, stored as 2 Ciphertext Elements |
| 📦 Encrypted Channel Key | 37 field elements, packing 768 uncompressed Kyber coefficients |
| 🧮 Opening circuit | 49,223 R1CS constraints, 38 public inputs |
| 🧾 Opening proof | 384 bytes, Groth16 on BN254 |
| ⏱️ Proving | about 8 s on the CPU, in the browser; WebGPU takes over where it can |
| ⛽ Gas | joining 0.36M, opening a Channel 0.83M, a message about 240k (`docs/gas.md`) |
| 🚀 Deploy | 22.6M gas on Sepolia: Verifier 18.1M, PqMsg 4.5M |
| 📥 One-time download | 42 MB: `pqmsg.wasm` 15 MB, proving key 22 MB, constraint system 5 MB |
| 🛡️ Kyber hardness | ≥ 112 bits classical core-SVP, NIST level 1 |
| 🧪 Tests | 15 Foundry, 33 Go |

## CROPS

pq leads with **privacy**: only a Channel's two ends can read it, even with a future quantum computer, and the chain never shows who is talking to whom.

- **Censorship resistant.** PqMsg has no allowlist, and its owner can only swap the Verifier. The Fixed Sender can refuse to send, but `openChannel` and `post` take calls from any wallet, at the cost of showing who sent them. Likewise anyone can store a User Key or Channel on Arkiv, and readers take any copy that hashes right.
- **Open source.** MIT-licensed. Everything builds from this repo: `yarn circuits:build` builds the circuit, Verifier and WASM prover, `yarn deploy` the contracts, and `yarn start` the app.
- **Private.** The chain shows only the Fixed Sender opening Channels and posting ciphertexts (ADR-0003). The RPC server sees your address and which messages you read, but not whom you open a Channel to, as their User Key comes over Anon-RPC (`docs/anon-rpc.md`). The app has no trackers or analytics.
- **Secure.** Channel Keys are encrypted to Kyber512 keys, with a Groth16 proof that each encryption is well formed, though its setup is dev-only. Your Sender Key, kept only in memory, comes from a passkey that only answers pq's own domain. Channel Keys stay in this browser's storage unencrypted, and "Find my chats" restores them.

## Docs

| File | What's in it |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | The protocol, its primitives, the key tree, what the opening proof shows, and a code map |
| [PROVING.md](PROVING.md) | Proving on the GPU, and a DevTools profiling demo |
| [SECURITY.md](SECURITY.md) | What is post-quantum and what isn't yet, and the known gaps |
| [DEPLOY.md](DEPLOY.md) | Deploying to Sepolia, the live addresses, and swapping the Verifier |
| [GLOSSARY.md](GLOSSARY.md) | The terms used everywhere |
| [docs/adr/](docs/adr/) | Key decisions |
| [docs/security/open-channel-proof.md](docs/security/open-channel-proof.md) | What the OpenChannel proof checks, and how post-quantum pq is |
| [docs/anon-rpc.md](docs/anon-rpc.md) | How the app reads a recipient's User Key over Anon-RPC |
| [docs/gas.md](docs/gas.md) | Sepolia gas before and after moving User Keys and Channels to Arkiv |
| [arkiv/](arkiv/) | How pq uses Arkiv: schema, friction, reach, why Arkiv |

## Arkiv

pq keeps each User Key and Channel on [Arkiv](https://arkiv.network)'s Rabdi testnet (chain 7794095), and only its keccak256 on PqMsg (ADR-0005). The Fixed Sender writes every entity; whoever reads one checks it hashes to PqMsg's hash. Under Sepolia's Glamsterdam gas, this cut `register` from 3.02M to 0.36M gas and `openChannel` from 5.01M to 0.83M, and Arkiv charges the Fixed Sender about 0.5M Rabdi gas per entity; `docs/gas.md` has the transactions. `Registered` and `ChannelOpened` carry each hash too.

So far the Fixed Sender writes to Arkiv and checks User Keys against PqMsg there (`app/api/fixed-sender/route.ts`). The app still reads User Keys and Channels from PqMsg, as before ADR-0005, so it can't use this deployment until it reads them from Arkiv, which comes next.

- **Wallet that writes the entities:** `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`, the Fixed Sender ([on the explorer](https://rabdi.explorer.arkiv.network/address/0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C)).
- **A query to run:** every pq entity for the Sepolia PqMsg, User Keys and Channels alike:

  ```sh
  curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"arkiv_query\",\"params\":[\"pqmsg = str('0xfbf7e8e3cc9c6c641f23ab5be6cabc919a8af515')\",{\"limit\":100,\"select\":{\"owner\":true,\"attributes\":true}}]}"
  ```

The judging write-ups are in `arkiv/`: `schema.md` (entities, fields, owners, expiry), `friction.md`, `reach.md`, `why-arkiv.md` and `how-you-use-arkiv.md`.

## Run locally

You need Node 20.18.3 or later, Yarn through Corepack, and Foundry. Go 1.26 is needed only to rebuild the circuit; its built files are committed.

```sh
yarn install
yarn chain    # anvil, in its own terminal
yarn deploy   # the Verifier and PqMsg, on anvil
yarn start    # the app, at http://localhost:3000
```

To change the circuit, run `yarn circuits:build`. It runs a fresh setup, so it regenerates `Verifier.sol` and the proving key together, and you redeploy afterwards. `sh packages/circuits/build.sh wasm` rebuilds only the WASM and the WebGPU bundle, and keeps the setup.

## Test

```sh
yarn test                                 # PqMsg, with a real proof
(cd packages/circuits && go test ./...)   # the circuit's proofs and rejections, Kyber, the hashes
yarn next:lint && yarn next:check-types
```

CI runs only the lint and type checks so far.

## How we used AI

pq is built with Claude Code. It wrote most of the code, tests and docs from our prompts, and we reviewed, steered and tested each change. For the Arkiv move, it read Arkiv's docs and SDK, wrote ADR-0005, changed the contract and the Fixed Sender, measured gas on Sepolia and Arkiv, and drafted the `arkiv/` write-ups. Commits it co-wrote carry a `Co-Authored-By: Claude` trailer.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
