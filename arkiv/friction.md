# Arkiv friction

What we hit moving pqmsg's User Keys and Channels onto Arkiv's Rabdi testnet with `@arkiv-network/sdk` 1.0.0 and 1.0.1, on 2026-11-06. Most important first.

## What broke

### 1. Running out of funds reads as a contract failure

- **Expected:** `createEntity` from an unfunded account says it has insufficient funds.
- **Actual:** `EntityMutationError: Transaction failed: Execution error without revert data`. The real `InsufficientFundsError` ("have 0 want 180637200000000") is only in `.cause`.
- **Why:** `src/utils/arkivTransactions.ts` (lines 265–271 in 1.0.1) rewrites any `ContractFunctionExecutionError` whose cause isn't a revert into that message.
- **Reproduce:** `createWalletClient({ chain: rabdi({ accessKey: "" }), transport: http(), account: privateKeyToAccount(generatePrivateKey()) }).createEntity(schema, values, { expiration: ExpirationTime.fromDays(1) })`.

This was our most likely failure, since a server key that writes entities runs dry eventually.

### 2. Filtering on an attribute that isn't indexed silently matches nothing

- **Expected:** an error. The typed builder catches it at compile time, with a very good message: `"data" is a bytes column, and bytes are never indexed, so it cannot be filtered on. Index a hash of it, as a hex str, instead`.
- **Actual:** the raw query `note = str('minimal entity 0')` returns `data: []` and `count: 0`, although entity `0x6de6…21a3` has exactly that value in a non-indexed `note`.
- **Reproduce:** `arkiv_query` with that string on Rabdi.

### 3. You can't keep an entity for a year, and the SDK offers you a year

- **Expected:** `ExpirationTime.fromYears(1)` works, or isn't offered.
- **Actual:** it throws `InvalidExpiryError` before sending, because the longest lifetime is 7,884,000 blocks, about 182.5 days. The Introduction and "Store your first entity" pages don't mention the cap; only the Limits and Expiration pages do.
- **Also:** 1.0.1 adds `ExpirationTime.max()`, but 1.0.0 has no way to ask for the longest lifetime, so we hard-coded `fromDays(182)`.
- **What we wanted:** a year for User Keys, which are long-lived identity data, or an entity that stays until its owner deletes it.

### 4. Funding needs a human

The faucet needs Sign-In with Ethereum, an email registration and a captcha. `POST https://hub.arkiv.network/api/faucet` with `{recipient}` returns `401`. So an agent or a CI job can't fund the account it writes with, and our Arkiv writes waited on a person claiming tGLM for the Fixed Sender. A key-gated faucet API, or a dev-mode chain with funded accounts like anvil's, would fix this.

## What got in the way

5. **The old query syntax gets an unhelpful error.** `app = "pqmsg" && kind = "channel"` returns `-32001 "unexpected character"` at position 6. Untagged strings get a good message (`-32002 "untagged strings are only valid for system attributes — write str('…')"`), so this could too.
6. **`rabdi` is a function with a required access key.** `rabdi()` and `rabdi({})` throw `MissingAccessKeyError`, and `rabdi({ accessKey: "" })` means "public endpoint" and logs a warning. The API reference lists `localhost` and `tiramisu` chains, and `/typescript-sdk/api-reference/chains/functions/rabdi/` is a 404.
7. **The docs describe a different SDK.** `llms.txt` and the pagination page use `ne`, `not`, `next`, `for await`, `cursor` and `atBlock`; the API reference still lists `jsonToPayload`, `stringToPayload` and `InvalidContentTypeError`. None of these are in 1.0.x, where `@arkiv-network/sdk/query` exports `and`, `or`, `eq`, `gt`, `gte`, `lt`, `lte`, `between`, `startsWith`, `exists` and `hasType`. The README's sample still pins `^0.9.0`.
8. **The node pages with a cursor nobody can use.** `arkiv_query` returns a `cursor` (`"b64:EAIXf_AS4LYAAAAAAAAAAQ"`) and has a "cursor belongs to a different query" error, but the JSON-RPC docs say "There is no cursor" and the SDK has no cursor option. We page with `offset`, which shifts if entities are created mid-download.
9. **Bytes go in as `Uint8Array` and come back as hex.** `createEntity` needs `Uint8Array` for a `bytes()` column (a viem `Hex` is a type error), and queries return `entity.data.value` as a `Hex` string. Either is fine; both is a trap.
10. **Releases are too new for supply-chain gates.** pqmsg's Yarn config refuses packages under 7 days old, and 1.0.1 was 4 days old, so we use 1.0.0. With several releases a week, a changelog of what changed between them would help.
11. **No fee formula.** "A shorter lifetime costs less" is all the docs say. We estimated: a 1.2 KB entity costs about 173k gas for a day and 534k for the longest lifetime. A formula would let us price storage before writing.

## What we'd like next

- A permanent or renewable-by-anyone lifetime for identity data such as public keys. `permissionlessExtension` exists as a flag, but isn't in the guides.
- Entities keyed by a content hash, so "store these bytes under keccak256(bytes)" is one call, with the node checking the hash. That's how pqmsg uses Arkiv, and the SDK's own error messages suggest it.
- The CORS policy, rate limits (we saw `ratelimit: limit=2000`) and the `Arkiv-Cost` and quota headers, documented.
