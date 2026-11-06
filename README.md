# pqmsg

Tiny private messages on Ethereum, with a post-quantum key exchange.

pqmsg stores every message publicly on-chain, yet only the two ends of a conversation can read it, and the chain doesn't show who is talking to whom. Each conversation's key travels encrypted with Kyber512, a lattice-based scheme designed to resist quantum computers, and a zero-knowledge proof made in your browser shows it was encrypted correctly. Every key comes from one wallet signature, so there's nothing to back up.

**Why it matters.** Whatever goes on a public chain stays there forever. Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists. pqmsg is a working testbed for private messaging on a public chain without that expiry date, and it's explicit about the parts that aren't post-quantum yet (see [Security considerations](#security-considerations)).

Status: Phase 1, on the Sepolia testnet. A research prototype, not audited.

Terms are defined in `GLOSSARY.md`; key decisions are in `docs/adr/`.

## How it works

The flow is,
1. Users connect their wallet and register a User Key, a Kyber512 public key derived from the same wallet signature as their Sender Key (ADR-0002).
2. Registered Users are shown in a list, and the sender picks a recipient.
3. The sender opens a Channel to them. Its Channel Key is H(Sender Key, recipient's User Index), and the Sender Key is derived from a wallet signature (ADR-0002). The sender encrypts it to the recipient's User Key (Kyber512 CPA-PKE, uncompressed), and the circuit proves that the Channel Key hashes to the Channel Key Hash and that the Encrypted Channel Key encrypts it. The User Key is a private input, so the recipient stays hidden (ADR-0003). The recipient finds the Channel by decrypting every Encrypted Channel Key and checking each result against its Channel Key Hash, and learns who opened it from the Encrypted Sender. Nothing is shared out of band.
4. To send a message, the sender derives the Message Key = H(Channel Key, Message Index) and the Message ID = H(Message Key, 0). The message's two 31-byte halves become the two Ciphertext Elements by adding H(Message Key, 1) and H(Message Key, 2) respectively (hash and add). In Phase 1 this happens outside the circuit.
5. The contract stores the two Ciphertext Elements as u256 values in a publicly readable hashmap keyed by Message ID. The recipient finds messages by checking Message IDs from Message Index 0 upward.

A Fixed Sender (a stand-in for a future relayer) submits Channel openings and messages, so they don't reveal who is talking. Registration comes from the user's own wallet.

Contract stores:
1. List of registered Users with their User Key (an 800-byte packed Kyber512 public key).
2. Channels array: each Channel's Channel Key Hash, Encrypted Channel Key and Encrypted Sender.
3. Messages: hashmap of Message ID to the two Ciphertext Elements.

It emits `Registered(user)`, `ChannelOpened(channelKeyHash)` and `Posted(messageId)`, each indexed.

Right after you open a Channel, and under each message you sent from this browser, the app links the transaction on Etherscan, which shows only the Fixed Sender calling PqMsg.

## Architecture

Set up with Scaffold-ETH 2 using Foundry (`npx create-eth@latest -s foundry`), plus a gnark circuit in Go. Scripts compile the circuit, run a dev-only Groth16 setup on BN254, export the Solidity verifier, and build a WASM prover for the frontend. Every hash is gnark's standard Poseidon2 (ADR-0001). It deploys to Sepolia, with anvil for local development.

| Job | Primitive | Code |
| --- | --- | --- |
| Carry the Channel Key to its recipient | Kyber512 CPA-PKE (NIST level 1), with the ciphertext left uncompressed so the circuit can check it | `packages/circuits/kyber.go`, `native/` |
| Prove the Encrypted Channel Key is well formed | Groth16 on BN254 (gnark v0.16), checked on-chain by `Verifier.sol` | `packages/circuits/circuits.go`, `circuit/` |
| Every hash, key derivation and message pad | gnark's Poseidon2 on BN254, in Merkle-Damgård mode | `packages/circuits/circuits.go` |
| Encrypt a message | Each 31-byte half plus a Poseidon2 pad, in BN254's scalar field | `circuits.Encrypt` |
| Root secret | Poseidon2 of a wallet signature over `pqmsg: derive Sender Key v1` | `packages/nextjs/hooks/useSenderKey.ts` |

The browser runs the same Go code, compiled to WASM (`packages/circuits/cmd/wasm`), so each hash and each Kyber step has one implementation, natively, in the circuit and in the browser. Kyber comes from Cloudflare's CIRCL, through the `mistcash/circl` fork (v1.6.4-e.1), which exports Kyber512's internal polynomial math as `pke/kyber/kyber512/math` for the circuit and its witness.

### Keys

Every key comes from one wallet signature (ADR-0002). H is Poseidon2, and `tag` is 2⁶⁴, an input no User Index or Message Index can take.

```
wallet signature over "pqmsg: derive Sender Key v1"
└─ Sender Key = H(signature)                            kept in memory, never sent
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

## Security considerations

pqmsg aims to let only a Channel's two ends read its messages, and to keep who talks to whom off the chain: the recipient is a private input to the proof, the sender is encrypted, and the Fixed Sender submits both. It's a testnet prototype and hasn't been audited. This is where it falls short today.

### What is post-quantum, and what isn't yet

| Part | Rests on | Against a quantum attacker | If it breaks |
| --- | --- | --- | --- |
| Carrying Channel Keys | Module-LWE (Kyber512, NIST level 1) | Holds | That Channel's messages |
| Hashes, Message Keys and pads | Poseidon2 | Holds; Grover's speed-up on hashes is only quadratic | Messages |
| The opening proof's soundness | Pairings on BN254 (Groth16) | Breaks | Forged Channel openings: junk, not leaks. Groth16 is perfectly zero-knowledge, so proofs still hide the recipient. |
| The Sender Key | The wallet's secp256k1 key | Breaks | Everything the User sent and received |

**The Sender Key is the weak link.** It's a hash of a wallet signature, and the app only accepts wallets that sign deterministically. Registering sends a transaction from that wallet, which reveals its public key. A quantum attacker who recovers the private key from it can sign `pqmsg: derive Sender Key v1` again, get the same Sender Key, and from it the User's Kyber secret key and every Channel Key they opened. So harvest now, decrypt later works against registered Users today. Fixing it means a root secret that doesn't come from the wallet's ECDSA key, at the cost of ADR-0002's "nothing to back up".

### Keys, and where they live

- **No ephemeral keys.** Every key comes from the Sender Key, by design (ADR-0002), so there's no forward secrecy and no re-keying. A leaked Sender Key exposes every Channel its User opened and every Channel opened to them, since their User Key comes from it too.
- **Only sign it on pqmsg.** Any site that gets your wallet to sign `pqmsg: derive Sender Key v1` learns your Sender Key, because a plain `personal_sign` isn't tied to the site that asked.
- **Sender Keys stay in memory** for the page's lifetime and are never sent anywhere.
- **Channel Keys are cached unencrypted in `localStorage`**, so anyone who can run script in this browser profile (an XSS bug, an extension) or open it can read your chats. **Find my chats** rebuilds them from one signature, so they could live in memory instead. The app doesn't set a Content Security Policy yet.

## Design

See `DESIGN.md`.

## Deploy to Sepolia

Locally, `yarn chain`, `yarn deploy` and `yarn start` run everything on anvil, with an anvil account as the Fixed Sender. To ship to Sepolia:

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

Install matt pocock skills before starting.
