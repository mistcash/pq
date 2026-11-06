# Why Arkiv

## What Arkiv replaced

Ethereum storage. Since Sepolia's Glamsterdam upgrade (EIP-8037), each new byte of state costs about 1,530 gas, so storing pqmsg's User Keys and Channels on PqMsg cost millions of gas per call. We measured both versions on Sepolia (`docs/gas.md`, with transaction links):

| Call | Data on PqMsg | Data on Arkiv, keccak256 on PqMsg | Saved |
| --- | ---: | ---: | ---: |
| `register` | 3,113,643 gas | 360,732 gas | 88% |
| `openChannel` | 5,014,387 gas | 831,040 gas | 83% |

The same User Key or Channel on Arkiv costs the Fixed Sender Rabdi gas instead: about 0.53M gas, or 0.00053 tGLM at 1 gwei, for a 1.2 KB entity kept for the longest lifetime Rabdi allows (`eth_estimateGas` on Rabdi).

## If we swapped Arkiv for Postgres

pqmsg's promise is that nobody, us included, can read your chats or tell who talks to whom. A database we run would break the second half and weaken the first:

- **We could withhold or swap data, quietly.** Postgres answers whatever we tell it. With Arkiv, every entity is public, and a reader checks it against PqMsg's hash, so a host can't serve a different User Key and read the Channel opened to it. Postgres would make that check against data only we hold.
- **Users would depend on our server staying up.** Anyone can query Arkiv's RPC directly, from a browser (it sends CORS headers) or with the `curl` in `schema.md`. Losing our Fixed Sender means users can't send, but they can still find their Channels and keys.
- **Nobody could audit what we store.** Every pqmsg entity, its owner and its expiry are public on [Rabdi's explorer](https://rabdi.explorer.arkiv.network/address/0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C). That matters for an app that claims to store nothing that names who talks to whom: you can check.
- **Any app could read it.** User Keys are a directory of post-quantum public keys keyed by wallet. Another app can query `arkiv.schema = str('pqmsg.userKey')` and encrypt to pqmsg's users without asking us.

Arkiv's expiry also matches the data: a key whose owner hasn't opened pqmsg in six months lapses, and comes back when they return.

## What we kept off Arkiv, and why

- **The hashes, on Ethereum.** PqMsg decides which User Key and Channel count. Arkiv only has to keep the bytes available, so a wrong or missing entity can stop a Channel opening, but can't make anyone encrypt to the wrong key.
- **The proof check, on Ethereum.** `openChannel` still checks the Groth16 proof on-chain, against the Encrypted Channel Key in its calldata, so every Channel Hash on PqMsg belongs to a well-formed encryption.
- **Messages, on Ethereum.** Each is two 32-byte Ciphertext Elements under a Message ID, about 240k gas. Moving them would save little, and would make Arkiv's availability decide whether a message can be read. We may revisit, as messages are the most numerous thing pqmsg stores.
- **Secrets, in your browser.** Sender Keys stay in memory and Channel Keys in `localStorage`. Nothing secret goes to Arkiv: User Keys are public keys, and Channels are ciphertexts.
