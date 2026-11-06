# Anon-RPC in pqmsg

To open a Channel, the app needs the recipient's User Key, which it reads from PqMsg with `userKeys(recipient)`. ADR-0003 keeps the recipient off the chain, but reading their key directly tells the RPC server, along with your IP, who you're about to message. So that read goes through [Anon-RPC](https://ethereum.github.io/anon-rpc/).

## How

- `utils/anonRpc.ts` starts Nox, Anon-RPC's Sphinx mixnet, as soon as you tap to open a Channel, so it boots while you sign. Nox's specifier contract, [`0x3513…7A9A`](https://sepolia.etherscan.io/address/0x35133267A8F7EC35046a83DCA0f4Ca8A6e1b7A9A) on Sepolia, pins the hash of Nox's worker code. The harness checks the code against it, then runs it in a sandboxed iframe.
- `anonRead` gives viem Nox's `fetch`, so the `eth_call` travels through Nox's entry, mix and exit nodes. TLS to the RPC runs inside the worker, so the RPC server sees an exit node instead of you, and the exit node can't read the call.
- `hooks/useOpenChannel.ts` reads the User Key this way, showing "Quietly looking up their key…" meanwhile.

## Fallback

Anon-RPC must never stop a Channel from opening, so the app reads directly, as it did before, when:

- it runs on anvil, which Nox can't reach;
- the harness doesn't load, Nox takes over 10 s to start (it retries for ever when it can't connect), or the read fails or takes over 15 s;
- the answer isn't a whole 800-byte User Key.

The console warns `Anon-RPC didn't load` or `Anon-RPC failed` when it can. Either way, the RPC server then sees that read, as it did before.

## What others still learn

Only this read goes through Anon-RPC. The app's other reads go to its regular RPC, which sees:

- your address, as the app reads your own User Key every block;
- the User list and every Channel, which everyone downloads whole, so they give nothing away;
- each Message ID you read, from Message Index 0 up, which groups a Channel's messages and shows the next one before you send it;
- the receipts you wait for after the Fixed Sender sends your Channel opening or message.

So the RPC server can tell that you opened a Channel, but not to whom, unless the fallback kicked in, or a quiet RPC lets it match the timing. Nox's startup reads its specifier through the regular RPC too, but everyone makes that same read.

Beyond the RPC server:

- The Fixed Sender's host sees your IP with each Channel opening and message it sends.
- On page load, WalletConnect's modal fetches its config from `api.web3modal.org`. Its telemetry and analytics are off (`services/web3/wagmiConnectors.tsx` and `.yarn/patches/`).

## Trust

You trust Nox's worker code as you trust the RPC server: it sees the read and its answer, and the specifier's owner can update it. A worker that answered with someone else's User Key would learn your Channel Key, just as a lying RPC server would.
