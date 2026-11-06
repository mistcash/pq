# pqmsg

Tiny private messages on Ethereum, with a post-quantum key exchange.

pqmsg stores every message publicly on-chain, yet only the two ends of a conversation can read it, and the chain doesn't show who is talking to whom. Each conversation's key travels encrypted with Kyber512, a lattice-based scheme designed to resist quantum computers, and a zero-knowledge proof made in your browser shows it was encrypted correctly. Every key comes from one passkey, made when you join.

**Why it matters.** Whatever goes on a public chain stays there forever. Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists. pqmsg is a working testbed for private messaging on a public chain without that expiry date, and it's explicit about the parts that aren't post-quantum yet (see [SECURITY.md](SECURITY.md)).

Status: Phase 1, on the Sepolia testnet. A research prototype, not audited.

Terms are defined in `GLOSSARY.md`; key decisions are in `docs/adr/`. What the OpenChannel proof checks, and how post-quantum pqmsg is, is in `docs/security/open-channel-proof.md`.

## How it works

1. Users connect their wallet and register a User Key, a Kyber512 public key derived from their Sender Key, which comes from a passkey they make when joining (ADR-0004).
2. Registered Users are shown in a list, and the sender picks a recipient.
3. The sender opens a Channel to them. Its Channel Key is H(Sender Key, recipient's User Index), and the Sender Key comes from the sender's passkey (ADR-0004). The sender encrypts it to the recipient's User Key (Kyber512 CPA-PKE, uncompressed), and the circuit proves that the Channel Key hashes to the Channel Key Hash and that the Encrypted Channel Key encrypts it. The User Key is a private input, so the recipient stays hidden (ADR-0003). The recipient finds the Channel by decrypting every Encrypted Channel Key and checking each result against its Channel Key Hash, and learns who opened it from the Encrypted Sender. Nothing is shared out of band.
4. To send a message, the sender derives the Message Key = H(Channel Key, Message Index) and the Message ID = H(Message Key, 0). The message's two 31-byte halves become the two Ciphertext Elements by adding H(Message Key, 1) and H(Message Key, 2) respectively (hash and add). In Phase 1 this happens outside the circuit.
5. The contract stores the two Ciphertext Elements as u256 values in a publicly readable hashmap keyed by Message ID. The recipient finds messages by checking Message IDs from Message Index 0 upward.

A Fixed Sender (a stand-in for a future relayer) submits Channel openings and messages, so they don't reveal who is talking. Registration comes from the user's own wallet.

Contract stores:
1. List of registered Users with their User Key (an 800-byte packed Kyber512 public key).
2. Channels array: each Channel's Channel Key Hash, Encrypted Channel Key and Encrypted Sender.
3. Messages: hashmap of Message ID to the two Ciphertext Elements.

It emits `Registered(user)`, `ChannelOpened(channelKeyHash)` and `Posted(messageId)`, each indexed.

Right after you open a Channel, and under each message you sent from this browser, the app links the transaction on Etherscan, which shows only the Fixed Sender calling PqMsg.

Deep dive mode (🤿 in the header) explains each step as it happens: what ran in the browser, the circuit and on-chain, the values involved (secrets hidden until tapped), and what to watch out for. It's a sidebar on desktop and sits below the page on phones.

## CROPS

pqmsg leads with **privacy**: only a Channel's two ends can read it, even with a future quantum computer, and the chain never shows who is talking to whom.

- **Censorship resistant.** PqMsg has no allowlist, and its owner can only swap the Verifier. The Fixed Sender can refuse to send, but `openChannel` and `post` take calls from any wallet, at the cost of showing who sent them.
- **Open source.** MIT-licensed. Everything builds from this repo: `yarn circuits:build` builds the circuit, Verifier and WASM prover, `yarn deploy` the contracts, and `yarn start` the app.
- **Private.** The chain shows only the Fixed Sender opening Channels and posting ciphertexts (ADR-0003). The RPC server sees your address and which messages you read, but not whom you open a Channel to, as their User Key comes over Anon-RPC (`docs/anon-rpc.md`). The app has no trackers or analytics.
- **Secure.** Channel Keys are encrypted to Kyber512 keys, with a Groth16 proof that each encryption is well formed, though its setup is dev-only. Your Sender Key, kept only in memory, comes from a passkey that only answers pqmsg's own domain. Channel Keys stay in this browser's storage unencrypted, and "Find my chats" restores them.

## Architecture

Set up with Scaffold-ETH 2 using Foundry (`npx create-eth@latest -s foundry`), plus a gnark circuit in Go. Scripts compile the circuit, run a dev-only Groth16 setup on BN254, export the Solidity verifier, and build a WASM prover for the frontend. Every hash is gnark's standard Poseidon2 (ADR-0001). It deploys to Sepolia, with anvil for local development.

| Job | Primitive | Code |
| --- | --- | --- |
| Carry the Channel Key to its recipient | Kyber512 CPA-PKE (NIST level 1), with the ciphertext left uncompressed so the circuit can check it | `packages/circuits/kyber.go`, `native/` |
| Prove the Encrypted Channel Key is well formed | Groth16 on BN254 (gnark v0.16), checked on-chain by `Verifier.sol` | `packages/circuits/circuits.go`, `circuit/` |
| Every hash, key derivation and message pad | gnark's Poseidon2 on BN254, in Merkle-Damgård mode | `packages/circuits/circuits.go` |
| Encrypt a message | Each 31-byte half plus a Poseidon2 pad, in BN254's scalar field | `circuits.Encrypt` |
| Root secret | Poseidon2 of a passkey's WebAuthn PRF output on `pqmsg: derive Sender Key v2` | `packages/nextjs/utils/passkey.ts` |

The browser runs the same Go code, compiled to WASM (`packages/circuits/cmd/wasm`), so each hash and each Kyber step has one implementation, natively, in the circuit and in the browser. Kyber comes from Cloudflare's CIRCL, through the `mistcash/circl` fork (v1.6.4-e.1), which exports Kyber512's internal polynomial math as `pke/kyber/kyber512/math` for the circuit and its witness.

### Keys

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

### What the opening proof shows

`openChannel` checks a Groth16 proof against 38 public inputs: the Channel Key Hash and the 37 elements of the Encrypted Channel Key. The proof shows that its maker knows a Channel Key that hashes to the Channel Key Hash, and that the Encrypted Channel Key is a Kyber512 encryption of it with in-range noise.

It doesn't show whose key it was encrypted to. The Kyber public key is a private input (ADR-0003), so the chain never learns the recipient, and a sender who encrypts to the wrong key only breaks their own Channel. The Encrypted Sender is outside the proof, so it doesn't prove who opened the Channel either.

### Code map

| Path | What's there |
| --- | --- |
| `packages/circuits` | The circuit (`circuits.go`, `circuit/`), Kyber in plain Go (`kyber.go`, `native/`), the browser module (`cmd/wasm`) and the setup (`cmd/artifacts`) |
| `packages/foundry` | `PqMsg.sol`, and `Verifier.sol`, generated from the circuit |
| `packages/nextjs` | The app; `public/circuits/` holds `pqmsg.wasm`, the prover worker, the proving key and gnark's WebGPU runtime |

## Proving on the GPU

Opening a Channel takes one Groth16 proof, made in the browser. On page load, the app starts a Web Worker (`public/circuits/prover.js`) that loads `pqmsg.wasm` and reads the proving key (22 MB) and constraint system (5 MB) once, so a proof only waits for the math. Kyber, Poseidon2 and the witness run in Go on the CPU, and the prover's heavy lifting moves to the GPU when it can:

1. The worker imports `gnark-webgpu.js`: gnark's WebGPU runtime and WGSL shaders, which `build.sh` bundles from the gnark version pinned in `go.mod`. Its `install()` opens a GPU device and sets `globalThis.gnarkGroth16WebGPU`.
2. `loadProver` finds that bridge and uploads the proving key to the GPU (`webgpu.Prepare`).
3. `groth16.Prove` then runs the G1 and G2 multi-scalar multiplications and the quotient's NTTs on the GPU.

Each step falls back to the CPU, so every browser can open a Channel:

- No WebGPU, or GPU setup over 10 s: the CPU proves. A CPU proof takes about 8 s, so a slower setup isn't worth the wait.
- `webgpu.Prepare` fails: the CPU proves.
- A GPU proof fails: the worker frees the GPU and proves on the CPU from then on.

The console says which it uses, `pqmsg prover on the GPU` or `on the CPU`, after `pqmsg prover: no WebGPU, <reason>`. On the GPU, the witness, including the secret Channel Key and noise, sits in GPU memory.

## Demo with DevTools profiling

1. Run the app locally (see [Run locally](#run-locally)) and open http://localhost:3000 in a browser with WebGPU, such as desktop Chrome or Edge.
2. Open DevTools. Once the prover has loaded, the Console says `pqmsg prover on the GPU`, or `on the CPU` with the reason.
3. Register two Users, one per browser profile. The local chain's Burner Wallet works; fund it with the faucet button in the header.
4. In the Performance panel, start recording, pick the other User and tap **Say hi 👋**. Stop once it says "You're connected!".
5. The prover's worker thread shows two measures: `pqmsg load`, from the worker's start to a loaded prover, and `pqmsg prove`, the proof itself. On the GPU path, the GPU track is busy during `pqmsg prove`.
6. For the CPU path, use a browser without WebGPU, or turn it off (in Firefox, set `dom.webgpu.enabled` to false in `about:config`), reload and record again.
7. The Network panel shows what each visitor downloads once: `pqmsg.wasm` (15 MB), `openChannel.pk` (22 MB) and `openChannel.ccs` (5 MB).

The other User finds the Channel by tapping **Find my chats**.

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

## Deploy to Sepolia

You need Node 20.18.3 or later, Yarn 4 (`corepack enable`) and Foundry, plus Go to rebuild the circuit. After `yarn install`, `yarn chain`, `yarn deploy` and `yarn start` run everything locally on anvil, with an anvil account as the Fixed Sender. To ship to Sepolia:

1. **Deployer.** Create a keystore with `yarn generate`, or import a key with `yarn account:import`. Fund its address with Sepolia ETH; `yarn account` shows the address and balance. The deployer becomes PqMsg's owner. The deploy uses about 17.3M gas in two transactions (Verifier 12.0M, PqMsg 5.4M), many times more than on local anvil, because Sepolia's Amsterdam fork charges far more for new contract code and storage. Forge's local simulation misses this, so live deploys estimate gas through the RPC (`--skip-simulation`).
2. **Deploy.** Run `yarn deploy --network sepolia --keystore <name>`. It reaches Sepolia through Alchemy with `ALCHEMY_API_KEY` from `packages/foundry/.env`; the template's shared key works, and your own avoids rate limits. It writes the address into `packages/nextjs/contracts/deployedContracts.ts`. Commit that file with `packages/foundry/broadcast/Deploy.s.sol/11155111/` and `packages/foundry/deployments/11155111.json`, so later deploys keep the Sepolia address.
3. **Fixed Sender.** Create a separate account with `cast wallet new` and send it Sepolia ETH. It pays the gas for every Channel opening (well over 1M gas, as it stores the 37-element Encrypted Channel Key) and message (about 240k gas), so keep it topped up.
4. **Frontend env.** Set these in `packages/nextjs/.env.local`, or in your host's environment settings, such as Vercel's:
   - `NEXT_PUBLIC_TARGET_NETWORK=sepolia`, which is read at build time.
   - `FIXED_SENDER_PRIVATE_KEY`: the Fixed Sender's key. It's server-only, so never prefix it with `NEXT_PUBLIC_`. Without it, sending fails with an error that names it.
   - `FIXED_SENDER_RPC_URL` (optional): a server-only Sepolia RPC for the Fixed Sender. It defaults to Alchemy with `NEXT_PUBLIC_ALCHEMY_API_KEY`.
   - `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (recommended): your own keys instead of the template's shared ones.
5. **Run.** `yarn start` serves the app in dev mode, and `yarn next:build && yarn next:serve` builds and serves it for production. On Vercel, `yarn vercel --prod` deploys it.

### Sepolia deployment

| Contract | Address |
| --- | --- |
| PqMsg | [`0xF4a1628850B5C030801002A7e10436699Dd4933C`](https://sepolia.etherscan.io/address/0xF4a1628850B5C030801002A7e10436699Dd4933C) |
| Verifier | [`0x5184F86dB5c85DB386554F2Cbfe232412741C5d3`](https://sepolia.etherscan.io/address/0x5184F86dB5c85DB386554F2Cbfe232412741C5d3) |

The owner is `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`. Both were deployed in blocks 12075350 and 12075351. The transactions are in `packages/foundry/broadcast/Deploy.s.sol/11155111/`. This deployment predates the events; they arrive with the next PqMsg deploy.

### Swapping the Verifier

The owner can replace the Verifier without redeploying PqMsg, which keeps its Users, Channels and messages:

1. `yarn circuits:build` regenerates `Verifier.sol` and the browser's proving key from one setup. They only work as a pair.
2. `forge create contracts/Verifier.sol:Verifier --rpc-url sepolia --account <owner> --broadcast` from `packages/foundry`.
3. `cast send <PqMsg> "setVerifier(address)" <new Verifier> --rpc-url sepolia --account <owner>`.
4. Ship the frontend with the new proving key.

If the circuit's number of public inputs changes, `openChannel` changes too, so PqMsg itself needs redeploying.

## Contributing

Issues and pull requests go to [mistcash/pqmsg](https://github.com/mistcash/pqmsg/issues). Use the terms in `GLOSSARY.md`, record decisions as ADRs in `docs/adr/`, and keep commits small, in [Conventional Commits](https://www.conventionalcommits.org/) style. The UI's direction is in `DESIGN.md`.

Install Matt Pocock's skills, pinned in `skills-lock.json`, before starting.
