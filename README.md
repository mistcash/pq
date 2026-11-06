# pqmsg

Tiny private messages on Ethereum, with a post-quantum key exchange.

pqmsg stores every message publicly on-chain, yet only the two ends of a conversation can read it, and the chain doesn't show who is talking to whom. Each conversation's key travels encrypted with Kyber512, a lattice-based scheme designed to resist quantum computers, and a zero-knowledge proof made in your browser shows it was encrypted correctly. Every key comes from one passkey, made when you join. User Keys and Channels live on [Arkiv](https://arkiv.network), and Ethereum keeps only their keccak256 hashes, which cut the gas to register by 88% and to open a Channel by 83% (see [Arkiv](#arkiv)).

**Why it matters.** Whatever goes on a public chain stays there forever. Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists. pqmsg is a working testbed for private messaging on a public chain without that expiry date, and it's explicit about the parts that aren't post-quantum yet (see [Security considerations](#security-considerations)).

Status: Phase 1, on the Sepolia testnet. A research prototype, not audited.

Terms are defined in `GLOSSARY.md`; key decisions are in `docs/adr/`. What the OpenChannel proof checks, and how post-quantum pqmsg is, is in `docs/security/open-channel-proof.md`.

## How it works

1. Users connect their wallet and register a User Key, a Kyber512 public key derived from their Sender Key, which comes from a passkey they make when joining (ADR-0004). PqMsg keeps only its keccak256, the User Key Hash, and the Fixed Sender stores the key itself on Arkiv (ADR-0005).
2. Registered Users are shown in a list, and the sender picks a recipient.
3. The sender opens a Channel to them. Its Channel Key is H(Sender Key, recipient's User Index), and the Sender Key comes from the sender's passkey (ADR-0004). The sender encrypts it to the recipient's User Key (Kyber512 CPA-PKE, uncompressed), and the circuit proves that the Channel Key hashes to the Channel Key Hash and that the Encrypted Channel Key encrypts it. The User Key is a private input, so the recipient stays hidden (ADR-0003). The recipient finds the Channel by decrypting every Encrypted Channel Key and checking each result against its Channel Key Hash, and learns who opened it from the Encrypted Sender. Nothing is shared out of band. The Fixed Sender stores the Channel on Arkiv, and PqMsg keeps only its keccak256, the Channel Hash (ADR-0005).
4. To send a message, the sender derives the Message Key = H(Channel Key, Message Index) and the Message ID = H(Message Key, 0). The message's two 31-byte halves become the two Ciphertext Elements by adding H(Message Key, 1) and H(Message Key, 2) respectively (hash and add). In Phase 1 this happens outside the circuit.
5. The contract stores the two Ciphertext Elements as u256 values in a publicly readable hashmap keyed by Message ID. The recipient finds messages by checking Message IDs from Message Index 0 upward.

A Fixed Sender (a stand-in for a future relayer) submits Channel openings and messages, so they don't reveal who is talking. Registration comes from the user's own wallet.

Contract stores:
1. List of registered Users with their User Key Hash, the keccak256 of their 800-byte packed Kyber512 public key.
2. Channels array: each Channel's Channel Hash, the keccak256 of its Channel Key Hash, Encrypted Channel Key and Encrypted Sender.
3. Messages: hashmap of Message ID to the two Ciphertext Elements.

Arkiv stores each User Key and each Channel whole, under its hash, and the app drops any that doesn't hash to one on PqMsg.

It emits `Registered(user)`, `ChannelOpened(channelKeyHash)` and `Posted(messageId)`, each indexed.

Right after you open a Channel, and under each message you sent from this browser, the app links the transaction on Etherscan, which shows only the Fixed Sender calling PqMsg.

Deep dive mode (🤿 in the header) explains each step as it happens: what ran in the browser, the circuit and on-chain, the values involved (secrets hidden until tapped), and what to watch out for. It's a sidebar on desktop and sits below the page on phones.

## CROPS

pqmsg leads with **privacy**: only a Channel's two ends can read it, even with a future quantum computer, and the chain never shows who is talking to whom.

- **Censorship resistant.** PqMsg has no allowlist, and its owner can only swap the Verifier. The Fixed Sender can refuse to send, but `openChannel` and `post` take calls from any wallet, at the cost of showing who sent them. Likewise anyone can store a User Key or Channel on Arkiv, and the app takes any copy that hashes right.
- **Open source.** MIT-licensed. Everything builds from this repo: `yarn circuits:build` builds the circuit, Verifier and WASM prover, `yarn deploy` the contracts, and `yarn start` the app.
- **Private.** The chain shows only the Fixed Sender opening Channels and posting ciphertexts (ADR-0003). The RPC server sees your address and which messages you read, but not whom you open a Channel to, as their User Key comes over Anon-RPC (`docs/anon-rpc.md`). The app has no trackers or analytics.
- **Secure.** Channel Keys are encrypted to Kyber512 keys, with a Groth16 proof that each encryption is well formed, though its setup is dev-only. Your Sender Key, kept only in memory, comes from a passkey that only answers pqmsg's own domain. Channel Keys stay in this browser's storage unencrypted, and "Find my chats" restores them.

## Architecture

Set up with Scaffold-ETH 2 using Foundry (`npx create-eth@latest -s foundry`), plus a gnark circuit in Go. Scripts compile the circuit, run a dev-only Groth16 setup on BN254, export the Solidity verifier, and build a WASM prover for the frontend. Every hash is gnark's standard Poseidon2 (ADR-0001). It deploys to Sepolia, with anvil for local development.

| Job | Primitive | Code |
| --- | --- | --- |
| Keep User Keys and Channels available, cheaply | Arkiv entities on the Rabdi testnet, checked against keccak256 hashes on PqMsg | `packages/nextjs/utils/arkiv.ts`, `app/api/fixed-sender/route.ts` |
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
   │             its 800-byte public key goes on Arkiv, its keccak256 on-chain
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

## Security considerations

pqmsg aims to let only a Channel's two ends read its messages, and to keep who talks to whom off the chain: the recipient is a private input to the proof, the sender is encrypted, and the Fixed Sender submits both. It's a testnet prototype and hasn't been audited. This is where it falls short today.

### What is post-quantum, and what isn't yet

| Part | Rests on | Against a quantum attacker | If it breaks |
| --- | --- | --- | --- |
| Carrying Channel Keys | Module-LWE (Kyber512, NIST level 1) | Holds | That Channel's messages |
| Hashes, Message Keys and pads | Poseidon2 | Holds; Grover's speed-up on hashes is only quadratic | Messages |
| The opening proof's soundness | Pairings on BN254 (Groth16) | Breaks | Forged Channel openings: junk, not leaks. Groth16 is perfectly zero-knowledge, so proofs still hide the recipient. |
| The Sender Key | A passkey's PRF secret, through HMAC-SHA-256 | Holds | Everything the User sent and received |
| Who can replace a User Key | The wallet's secp256k1 key, through `register` | Breaks | Channels opened to the User after the swap |

**The wallet is the weak link.** The Sender Key comes from a passkey's PRF output (ADR-0004), which no public key reveals, so harvest now, decrypt later can't recover it from chain data, and past Channels stay safe. But `register` still overwrites, and only the wallet authorizes it. Registering reveals the wallet's public key, so a quantum attacker who recovers its private key can register their own User Key and read Channels opened to that User afterwards. The User would notice, since their passkey stops unlocking. A one-shot `register` would close this, but then a lost passkey would retire the address. A synced passkey is also only as safe as its provider's sync, which we haven't seen documented as post-quantum.

### Keys, and where they live

- **No ephemeral keys.** Every key comes from the Sender Key, by design (ADR-0002), so there's no forward secrecy and no re-keying. A leaked Sender Key exposes every Channel its User opened and every Channel opened to them, since their User Key comes from it too.
- **Passkeys are tied to pqmsg's domain.** Another site can't ask yours for its PRF output. But pqmsg on a new domain would need new passkeys, and losing yours loses every Channel (ADR-0004).
- **Sender Keys stay in memory** for the page's lifetime and are never sent anywhere.
- **Channel Keys are cached unencrypted in `localStorage`**, so anyone who can run script in this browser profile (an XSS bug, an extension) or open it can read your chats. **Find my chats** rebuilds them from one passkey tap, so they could live in memory instead. The app doesn't set a Content Security Policy yet.

### Known gaps in the protocol

- **Kyber512 CPA-PKE, not ML-KEM.** It's NIST level 1 and only CPA-secure, without the Fujisaki-Okamoto transform. User Keys never change, and the proof doesn't tie a ciphertext to a registered User Key, so anyone can post crafted ciphertexts to a User. If a User's behaviour shows whether one decrypted to a valid Channel, for example by replying, that's the plaintext-checking oracle that known key-recovery attacks on CPA Kyber need. Each try costs a Channel opening, at about 0.8M gas.
- **Messages aren't authenticated.** A Ciphertext Element is the message half plus a pad, so changing it shifts the plaintext predictably. Someone watching the mempool can front-run a `post` with altered Ciphertext Elements under the same Message ID: the recipient reads the altered message, and the real one reverts.
- **The trusted setup is single-party.** `cmd/artifacts` runs a dev-only Groth16 setup, and whoever runs it could keep its secret randomness and forge proofs. That allows junk Channel openings but exposes no messages. A multi-party ceremony should replace it before mainnet.
- **The contract doesn't refuse repeats.** The Fixed Sender refuses a Channel that's already open, but `openChannel` doesn't, so anyone can replay a proof. `getChannels` returns every Channel Hash, and each User fetches every Channel from Arkiv and trial-decrypts all of them.

### Side channels, memory and metadata

- **No side-channel guarantees.** The crypto runs as Go compiled to WASM, and nothing in a browser promises constant time. CIRCL's Kyber aims to be constant-time in native code; we don't claim that survives WASM.
- **No memory wiping.** Keys cross between JavaScript and Go as strings, which can't be zeroed, and stay on Go's heap until it's reclaimed. On the GPU path, the witness sits in GPU buffers.
- **The proving key is read without subgroup checks** (`UnsafeReadFrom`), which saves 18 s. It's served from the same origin as `pqmsg.wasm`, so anyone able to swap it could swap the prover too.
- **Metadata.** Registering is public. The RPC provider sees which Message IDs a browser polls, and the Fixed Sender sees the IP address behind each Channel opening and message. Arkiv's RPC sees whose User Key a browser fetches before opening a Channel.
- **Arkiv keeps the data available.** If an entity expires or Arkiv loses it, the hash on PqMsg can't bring it back: a Channel nobody can fetch can't be read. A User Key comes back the next time its owner unlocks; a Channel doesn't yet.

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

1. **Deployer.** Create a keystore with `yarn generate`, or import a key with `yarn account:import`. Fund its address with Sepolia ETH; `yarn account` shows the address and balance. The deployer becomes PqMsg's owner. The deploy uses about 22.5M gas in two transactions (Verifier 18.1M, PqMsg 4.4M), many times more than on local anvil, because Sepolia's Amsterdam fork charges far more for new contract code and storage. Forge's local simulation misses this, so live deploys estimate gas through the RPC (`--skip-simulation`).
2. **Deploy.** Run `yarn deploy --network sepolia --keystore <name>`. It reaches Sepolia through Alchemy with `ALCHEMY_API_KEY` from `packages/foundry/.env`; the template's shared key works, and your own avoids rate limits. It writes the address into `packages/nextjs/contracts/deployedContracts.ts`. Commit that file with `packages/foundry/broadcast/Deploy.s.sol/11155111/` and `packages/foundry/deployments/11155111.json`, so later deploys keep the Sepolia address.
3. **Fixed Sender.** Create a separate account with `cast wallet new` and send it Sepolia ETH. It pays the gas for every Channel opening (about 0.83M gas) and message (about 240k gas), so keep it topped up. It also stores User Keys and Channels on Arkiv's Rabdi testnet, so claim tGLM for it at the [Arkiv faucet](https://hub.arkiv.network/faucet), or set `ARKIV_PRIVATE_KEY` to another funded key.
4. **Frontend env.** Set these in `packages/nextjs/.env.local`, or in your host's environment settings, such as Vercel's:
   - `NEXT_PUBLIC_TARGET_NETWORK=sepolia`, which is read at build time.
   - `FIXED_SENDER_PRIVATE_KEY`: the Fixed Sender's key. It's server-only, so never prefix it with `NEXT_PUBLIC_`. Without it, sending fails with an error that names it.
   - `FIXED_SENDER_RPC_URL` (optional): a server-only Sepolia RPC for the Fixed Sender. It defaults to Alchemy with `NEXT_PUBLIC_ALCHEMY_API_KEY`.
   - `ARKIV_PRIVATE_KEY` (optional): a server-only key for Arkiv writes. It defaults to `FIXED_SENDER_PRIVATE_KEY`.
   - `NEXT_PUBLIC_ARKIV_ACCESS_KEY` (optional): an [Arkiv access key](https://hub.arkiv.network/access-keys), to lift the public RPC's rate limit.
   - `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (recommended): your own keys instead of the template's shared ones.
5. **Run.** `yarn start` serves the app in dev mode, and `yarn next:build && yarn next:serve` builds and serves it for production. On Vercel, `yarn vercel --prod` deploys it.

### Sepolia deployment

| Contract | Address |
| --- | --- |
| PqMsg | [`0x83Ba93654CaC7a6F9489E81c89F4AaA48d755c52`](https://sepolia.etherscan.io/address/0x83Ba93654CaC7a6F9489E81c89F4AaA48d755c52) |
| Verifier | [`0x56d42ba891FDC1f3367018f789aE964207499633`](https://sepolia.etherscan.io/address/0x56d42ba891FDC1f3367018f789aE964207499633) |

The owner is `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`. Both were deployed in blocks 12079574 and 12079575. The transactions are in `packages/foundry/broadcast/Deploy.s.sol/11155111/`.

### Swapping the Verifier

The owner can replace the Verifier without redeploying PqMsg, which keeps its Users, Channels and messages:

1. `yarn circuits:build` regenerates `Verifier.sol` and the browser's proving key from one setup. They only work as a pair.
2. `forge create contracts/Verifier.sol:Verifier --rpc-url sepolia --account <owner> --broadcast` from `packages/foundry`.
3. `cast send <PqMsg> "setVerifier(address)" <new Verifier> --rpc-url sepolia --account <owner>`.
4. Ship the frontend with the new proving key.

If the circuit's number of public inputs changes, `openChannel` changes too, so PqMsg itself needs redeploying.

## Arkiv

pqmsg keeps each User Key and Channel on [Arkiv](https://arkiv.network)'s Rabdi testnet (chain 7794095), and only its keccak256 on PqMsg (ADR-0005). The Fixed Sender writes every entity; whoever reads one checks it hashes to PqMsg's hash. Under Sepolia's Glamsterdam gas, this cut `register` from 3.11M to 0.36M gas and `openChannel` from 5.01M to 0.83M; `docs/gas.md` has the transactions.

- **Wallet that writes the entities:** `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`, the Fixed Sender ([on the explorer](https://rabdi.explorer.arkiv.network/address/0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C)).
- **A query to run:** every pqmsg entity for the Sepolia PqMsg, User Keys and Channels alike:

  ```sh
  curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"arkiv_query\",\"params\":[\"pqmsg = str('0x83ba93654cac7a6f9489e81c89f4aaa48d755c52')\",{\"limit\":100}]}"
  ```

The judging write-ups are in `arkiv/`: `schema.md` (entities, fields, owners, expiry), `friction.md`, `reach.md`, `why-arkiv.md` and `how-you-use-arkiv.md`.

## How we used AI

pqmsg is built with Claude Code. It wrote most of the code, tests and docs from our prompts, and we reviewed, steered and tested each change. For the Arkiv move, it read Arkiv's docs and SDK, wrote ADR-0005, changed the contract and app, measured gas on Sepolia and drafted the `arkiv/` write-ups. Commits it co-wrote carry a `Co-Authored-By: Claude` trailer.

## Contributing

Issues and pull requests go to [mistcash/pqmsg](https://github.com/mistcash/pqmsg/issues). Use the terms in `GLOSSARY.md`, record decisions as ADRs in `docs/adr/`, and keep commits small, in [Conventional Commits](https://www.conventionalcommits.org/) style. The UI's direction is in `DESIGN.md`.

Install Matt Pocock's skills, pinned in `skills-lock.json`, before starting.
