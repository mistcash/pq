# How pqmsg uses Arkiv

pqmsg is post-quantum private messaging on Ethereum. Its two big public objects, User Keys (800 bytes) and Channels (1,248 bytes), live on Arkiv as entities, and PqMsg on Sepolia keeps only their keccak256 (ADR-0005). The full schema is in `schema.md`.

This change moves the writes: PqMsg stores hashes, and the Fixed Sender, pqmsg's relayer, writes the entities. The app moves its reads to Arkiv next.

## Do the filters, owners and expiry fit the app?

**Filters.** Every filter is something pqmsg looks up by:

- `hash`: PqMsg gives a hash, and pqmsg needs the bytes behind it. The Fixed Sender looks a User Key up by `hash` before storing it, so it's stored once. Opening a Channel will read the recipient's User Key Hash over Anon-RPC, then fetch the key by `hash`. Bytes can't be indexed, which suits this design: we index the hash and keep the data in `data`.
- `pqmsg`: the PqMsg address, so a local anvil deployment, an old Sepolia one and the current one never mix.
- `channelKeyHash`: before paying for a Channel opening, the Fixed Sender looks one up by its Channel Key Hash, so a replayed proof is refused.
- `user`: pqmsg doesn't filter on it, but it makes the User Key directory readable by wallet for anyone else, for example `user = str('0x…')`.

**Owners.** The Fixed Sender owns every entity. That keeps a Channel's owner from naming its sender, which is the point of pqmsg's Fixed Sender, and spares users an Arkiv wallet and faucet. Ownership grants no trust: readers accept only data that hashes to PqMsg's hash, whoever wrote it.

**Expiry.** About 182 days, Arkiv's longest. Next, a User Key will be stored again whenever its owner unlocks pqmsg and finds it gone, so active Users stay reachable and absent ones lapse (`schema.md`).

## Does each Arkiv feature change something users see?

Live in this change:

| Arkiv feature | What users see |
| --- | --- |
| Entities with a `bytes` column | Joining costs 88% less gas: 0.36M instead of 3.02M. The Fixed Sender pays 0.83M gas per Channel instead of 5.01M, so it can keep opening them for free (`docs/gas.md`). |
| Query by `hash`, checked against PqMsg | The Fixed Sender refuses "That isn't your key." for a User Key that doesn't match the registered hash, and stores each key once. |
| Query by `channelKeyHash` | "That chat is already open." instead of a wasted transaction. |
| Public entities, owners and expiry | Anyone can see every pqmsg entity, its owner and when it expires, on [Rabdi's explorer](https://rabdi.explorer.arkiv.network/address/0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C) or with the query in `schema.md`. |

Next, with the app's reads:

| Arkiv feature | What users will see |
| --- | --- |
| Query by indexed `hash` | **Say hi** finds the other person's key on Arkiv while it shows "Quietly looking up their key…". |
| Query by `pqmsg`, paged | **Find my chats** downloads every Channel from Arkiv. |
| Expiry, with re-storing | Unlocking puts your key back if it expired, so people can message you again. |
| Entity keys and the explorer | Deep dive mode (🤿) tags values "🗄️ on Arkiv" and links each entity. |
| Public, CORS-enabled RPC | The browser reads Arkiv directly, with no server of ours in between. |

## Where it is in the code

- `packages/foundry/contracts/PqMsg.sol`: stores `keccak256(key)` and `keccak256(abi.encode(channel))`, and emits each in `Registered` and `ChannelOpened`.
- `packages/nextjs/app/api/fixed-sender/route.ts`: the Fixed Sender writes User Keys and Channels with `createEntity`. A Channel goes on Arkiv before its hash goes on Ethereum.
- `packages/nextjs/utils/arkiv.ts`: the schemas, and `fetchUserKey`, which keeps only bytes that hash to PqMsg's hash.
