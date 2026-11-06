# Arkiv schema

pqmsg stores two kinds of entity on Arkiv's Rabdi testnet (chain 7794095). Each holds the bytes behind a keccak256 hash that PqMsg keeps on Sepolia (ADR-0005). The schemas are in `packages/nextjs/utils/arkiv.ts`.

## `pqmsg.userKey`: a User Key

| Field | Type | Indexed | Value |
| --- | --- | --- | --- |
| `arkiv.schema` | str | yes | `pqmsg.userKey`, added by the SDK's named schema |
| `pqmsg` | str | yes | The PqMsg address, lowercase, so each deployment has its own entities |
| `hash` | str | yes | keccak256 of `data`, the User Key Hash that PqMsg's `userKeyHashes(user)` returns |
| `user` | str | yes | The User's wallet address, lowercase. It registered from that wallet, so this is public already. |
| `data` | bytes | no | The 800-byte packed Kyber512 public key |

## `pqmsg.channel`: a Channel

| Field | Type | Indexed | Value |
| --- | --- | --- | --- |
| `arkiv.schema` | str | yes | `pqmsg.channel` |
| `pqmsg` | str | yes | The PqMsg address, lowercase |
| `hash` | str | yes | keccak256 of `data`, the Channel Hash that PqMsg's `channels(i)` holds |
| `channelKeyHash` | str | yes | The Channel Key Hash, as 32 bytes of hex |
| `data` | bytes | no | `abi.encode(channelKeyHash, encryptedChannelKey[37], encryptedSender)`, 1,248 bytes |

## Who owns them

The Fixed Sender, `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`, creates and owns every entity, so only it can update, extend or delete them. Users need no Arkiv funds. A Channel's owner is the Fixed Sender rather than its sender, so the entity doesn't show who opened it, just as the Sepolia transaction doesn't.

Ownership doesn't make the data trustworthy, and pqmsg doesn't rely on it: anyone can create an entity with these fields, and the app keeps only data whose keccak256 matches PqMsg's hash. The owner can delete or let an entity lapse, but can't change what a reader accepts.

## When they expire

After 182 days (`ExpirationTime.fromDays(182)`, 7,862,400 two-second blocks), just under Rabdi's longest lifetime of 7,884,000 blocks. We wanted a year; see `friction.md`.

- **A User Key** comes back the next time its owner unlocks pqmsg: `hooks/useSenderKey.ts` checks Arkiv, and asks the Fixed Sender to store the key again if it's gone. A key nobody has unlocked for six months belongs to someone who isn't reading their messages.
- **A Channel** isn't stored again yet. Its two ends cache the Channel Key in their browsers, so they keep chatting, but **Find my chats** on a new browser can't find a Channel that has expired. Re-storing it on each message is next.

## The queries the app runs

| Where | Filter | Why |
| --- | --- | --- |
| `fetchUserKey` before opening a Channel, and on unlock | `arkiv.schema = pqmsg.userKey AND pqmsg = <PqMsg> AND hash = <User Key Hash>` | One User Key, by the hash read from PqMsg over Anon-RPC |
| `fetchChannels` to check a Channel is open, and in **Find my chats** | `arkiv.schema = pqmsg.channel AND pqmsg = <PqMsg>`, 100 per page | Every Channel, so the download doesn't say which ones are yours |
| The Fixed Sender before opening a Channel | `arkiv.schema = pqmsg.channel AND pqmsg = <PqMsg> AND channelKeyHash = <Channel Key Hash>` | Refuses a replayed proof rather than pay for it again |

Try it, for every entity of the Sepolia PqMsg:

```sh
curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"arkiv_query\",\"params\":[\"pqmsg = str('0x83ba93654cac7a6f9489e81c89f4aaa48d755c52')\",{\"limit\":100}]}"
```
