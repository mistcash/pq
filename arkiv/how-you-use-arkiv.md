# How pqmsg uses Arkiv

pqmsg is post-quantum private messaging on Ethereum. Its two big public objects, User Keys (800 bytes) and Channels (1,248 bytes), live on Arkiv as entities, and PqMsg on Sepolia keeps only their keccak256 (ADR-0005). The full schema is in `schema.md`.

## Do the filters, owners and expiry fit the app?

**Filters.** Every filter is something the app looks up by:

- `hash`: PqMsg gives the app a hash, and the app needs the bytes behind it. Opening a Channel reads the recipient's User Key Hash over Anon-RPC, then fetches the key by `hash`. Bytes can't be indexed, which suits this design: we index the hash and keep the data in `data`.
- `pqmsg`: the PqMsg address, so a local anvil deployment, an old Sepolia one and the current one never mix.
- `channelKeyHash`: before paying for a Channel opening, the Fixed Sender looks one up by its Channel Key Hash, so a replayed proof is refused.
- `user`: the app doesn't filter on it, but it makes the User Key directory readable by wallet for anyone else, for example `user = str('0x…')`.

**Owners.** The Fixed Sender owns every entity. That keeps a Channel's owner from naming its sender, which is the point of pqmsg's Fixed Sender, and spares users an Arkiv wallet and faucet. Ownership grants no trust: readers accept only data that hashes to PqMsg's hash, whoever wrote it.

**Expiry.** About 182 days, Arkiv's longest. A User Key is stored again whenever its owner unlocks pqmsg and finds it gone, so active Users stay reachable and absent ones lapse. Channels aren't renewed yet (`schema.md`).

## Does each Arkiv feature change something users see?

| Arkiv feature | What users see |
| --- | --- |
| Entities with a `bytes` column | Join costs 88% less gas, and the Fixed Sender can afford to open Channels for free: 0.83M gas each instead of 5.0M. |
| Query by indexed `hash` | **Say hi** finds the other person's key on Arkiv, shown as "Quietly looking up their key…". If the key isn't there, they're told to ask them to open pqmsg. |
| Query by `pqmsg`, paged | **Find my chats** downloads every Channel from Arkiv and shows how many it checked and found. |
| Query by `channelKeyHash` | "That chat is already open." instead of a wasted transaction. |
| Expiry, with re-storing | Unlocking with your passkey quietly puts your key back if it expired, so people can message you again. |
| Entity keys and the explorer | Deep dive mode (🤿) tags the User Key, Encrypted Channel Key and Encrypted Sender "🗄️ on Arkiv", and links each new entity with "See it on Arkiv". |
| Public, CORS-enabled RPC | The browser reads Arkiv directly, with no server of ours in between. |

## Where it is in the code

- `packages/nextjs/utils/arkiv.ts`: the schemas, `fetchUserKey` and `fetchChannels`, which check every byte against PqMsg's hashes.
- `packages/nextjs/app/api/fixed-sender/route.ts`: the Fixed Sender writes User Keys and Channels with `createEntity`. A Channel goes on Arkiv before its hash goes on Ethereum.
- `packages/nextjs/hooks/useSenderKey.ts`: re-stores an expired User Key.
- `packages/foundry/contracts/PqMsg.sol`: stores `keccak256(key)` and `keccak256(abi.encode(channel))`.
