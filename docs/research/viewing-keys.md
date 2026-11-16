# Viewing keys and quantum risk: STRK20, Zcash, Privacy Pools

Researched 2026-11-12 for the launch video's opening chat. Question: what do viewing keys unlock in these three protocols, what protects that data, and could a quantum computer read it later from public data alone?

Sources are primary: specs, source code at pinned commits, and the projects' own docs and blogs. Third-party pages appear only as leads and are labelled. Anything I couldn't confirm is marked **unconfirmed**.

## Summary

| | STRK20 (Starknet Privacy Pool) | Zcash (Sapling, Orchard, Ironwood) | Privacy Pools v2 (0xbow) |
| --- | --- | --- | --- |
| What the viewing key is | The user's single privacy private key, a Stark-curve scalar. It also derives nullifiers. | Per account: an incoming viewing key (ivk), an outgoing viewing key (ovk), and a full viewing key (FVK) that covers both plus spends. | An X25519 key pair derived from a wallet signature, separate from the spending (nullifying) key. |
| What its holder sees | Everything that user does: incoming and outgoing transfers, counterparties, tokens, amounts, and when notes are spent. | ivk: incoming notes (amount, memo, which address). FVK adds outgoing notes (recipient, amount, memo), spends, and a balance. | Incoming notes only, past and future (value, token, label, note secret). Not outgoing. |
| Who holds it in practice | The user, plus an escrowed copy that the auditor can decrypt. That auditor's master key sits in a TEE run by Financial Privacy Inc. | The user. The user may give it to an auditor, exchange or regulator. | The user. The docs say to give it to an auditor, accountant or regulator for full receive history. |
| Is the key on-chain? | Yes. The public key and an ECDH-encrypted private key are written once, at registration. | No. It is shared off-chain as a Bech32 string (`uview1…`, `uivk1…`, `zxviews…`). | Only the public key, in the Keystore contract. The private key is shared off-chain. |
| Encrypted-to-compliance data on-chain | The encrypted viewing key of every registered user, plus the withdrawer's address on every withdrawal. | None | One ciphertext per deposit (`LabelRegistered`), encrypted to the ASP's key. |
| Encryption | ECDH on the Stark curve, then a Poseidon-hash mask added to the field element. Not authenticated. | Diffie–Hellman on Jubjub (Sapling) or Pallas (Orchard, Ironwood), BLAKE2b-256 KDF, ChaCha20-Poly1305 | X25519, SHA-256 KDF, XChaCha20-Poly1305 |
| What Shor needs | Public chain data only: the auditor public key, or any user's public key | The recipient's shielded address, which is not on-chain | Public chain data only: the viewing public key in the Keystore. The ASP key is published in the docs. |
| Post-quantum private? | No. Breaking one key exposes every registered user's full history. | Only while addresses stay secret | No, for incoming notes of registered users and for every deposit opening sent to the ASP |
| Project's own quantum statement | None for the pool. The quantum roadmap doesn't mention it. | Explicit: spec §8.7, ZIP 2005, ZIP 326, issue #6121 | None found |

## STRK20 (Starknet)

STRK20 exists and is live. It is StarkWare's privacy framework for any ERC-20 on Starknet, centred on the Starknet Privacy Pool ([blog, 2026-03-10](https://www.starknet.io/blog/make-all-erc-20-tokens-private-with-strk20/)). It went live on 2026-06-09 ([blog](https://www.starknet.io/blog/privacy-live-on-starknet/)), and private USDC followed on 2026-06-25 ([blog](https://www.starknet.io/blog/privacy-features-for-usdc-on-starknet/)).

It is a protocol and pool, not a SNIP token standard; I found no SNIP. The design paper is [ePrint 2026/474](https://eprint.iacr.org/2026/474). Its PDF was blocked to me, so **anything only in the paper is unconfirmed**. The code cited below is [starkware-libs/starknet-privacy @ 5759ef1](https://github.com/starkware-libs/starknet-privacy/tree/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb), referred to as `SP`.

### What it is and what it reveals

The viewing key is `user_private_key`, a Stark-curve scalar. Its public key is the x-coordinate of `k·G`, stored per address ([`privacy.cairo` L106–110](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/privacy.cairo#L106-L110), [`utils.cairo` L264](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/utils.cairo#L264)). The same key does four jobs:

- **Incoming.** It decrypts incoming channels. Each channel is ECDH-encrypted to the recipient's public key and carries the channel key and the sender's address ([`objects.cairo` L31](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/objects.cairo#L31)).
- **Outgoing.** It masks the recipient of outgoing channels with a hash that includes the sender's private key ([`objects.cairo` L78–87](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/objects.cairo#L78-L87)).
- **Amounts.** Note amounts and tokens are masked with hashes of the channel key ([`objects.cairo` L91](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/objects.cairo#L91)).
- **Spends.** It derives nullifiers: `nullifier = h(…, owner_private_key)` ([`hashes.cairo` L229](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/hashes.cairo#L229)).

So the holder sees all incoming and outgoing transfers, counterparties, tokens and amounts, and when each note is spent. Spending still needs the Starknet account's authorization: the paper's abstract says the pool "uses Starknet's account abstraction for authorization".

The key is immutable once set (`WriteOnce`, [`actions.cairo` L248](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/actions.cairo#L248)).

### Who holds it

- **The user.**
- **The auditor, by design.** The blog says: "Each user must create a viewer key in order to deposit into the pool", and "Viewer keys are then encrypted to a master key."
- **Where that master key lives.** "The master key is held inside a dual-enclave TEE operated by Financial Privacy Inc." It is backed by a 3-of-4 multisig (two StarkWare and two FPI signers) and by a 7-of-12 Security Council multisig.
- **How disclosure works.** On a lawful request, "FPI reencrypts that one transfer inside the enclave to the appropriate authority, and nothing else" ([blog, 2026-07-14](https://www.starknet.io/blog/compliance-layer-onchain-privacy-strk20/)).

So nobody *hands* a viewing key to an auditor. The auditor's access is built in at registration.

The wallet's discovery service also receives the viewing key. It travels over OHTTP using HPKE with X25519 ([`20-ohttp-integration.md` L67](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/crates/discovery-service/specs/20-ohttp-integration.md#L67)).

### How it is derived and shared

Derivation is up to the wallet; the SDK just takes a `ViewingKeyProvider`. The reference code shows two methods:

- **Demo app.** It signs `<chainId>:<poolAddress>` with Stark ECDSA and Poseidon-hashes the signature's `(r, s)` ([`demo/src/session.ts` L29](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/demo/src/session.ts#L29)).
- **Client package.** It runs a passphrase, salted with the account address, through 1,000 Poseidon rounds ([`client/src/viewing-key.ts` L51](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/client/src/viewing-key.ts#L51)).

The key is shared by putting it on-chain. `SetViewingKey` stores the public key and an `EncPrivateKey`, the private key encrypted to `auditor_public_key`. It also emits `ViewingKeySet(user_addr, public_key, enc_private_key)` ([`privacy.cairo` L319–357](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/privacy.cairo#L319-L357), [`events.cairo` L5](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/events.cairo#L5)).

### Cryptography

This is ECDH on the Stark curve ([`utils.cairo` L134](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/utils.cairo#L134)):

1. The wallet publishes the ephemeral point `R = rG`.
2. The shared point is `S = r·K_auditor`.
3. The ciphertext is `enc_private_key = Poseidon(TAG, S.x) + private_key`, a single field-element mask with no MAC ([`utils.cairo` L220](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/utils.cairo#L220), [`hashes.cairo` L44](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/hashes.cairo#L44)).

The same scheme encrypts other data to the auditor key:

- the withdrawer's address on every `Withdrawal` event;
- the owner's address on every open note.

See [`utils.cairo` L249](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/utils.cairo#L249) and [`events.cairo` L17](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/events.cairo#L17). These ciphertexts are the closest real thing to an "auditor commitment", though no source uses that term.

### Post-quantum status

Not post-quantum. Shor solves discrete logs on the Stark curve, and two paths need only public chain data:

1. **The auditor key path.** Take `auditor_public_key`, which sits in storage and in the `AuditorPublicKeySet` event, and recover the auditor's private key. That decrypts every stored `EncPrivateKey`, giving every registered user's viewing key and so their full history. It also decrypts every withdrawer's address.
2. **The per-user path.** Take any user's public viewing key from `ViewingKeySet` and recover that user's viewing key directly.

Rotating the auditor key doesn't protect old records. The contract notes that `enc_private_key` stays "encrypted to the auditor key active at registration" ([`interface.cairo` L814](https://github.com/starkware-libs/starknet-privacy/blob/5759ef1e5f95f2c1253c6570d3e151113e8dbeeb/packages/privacy/src/interface.cairo#L814)).

L2BEAT (a third party) reaches the same conclusion about the auditor key ([L2BEAT](https://l2beat.com/privacy/projects/strk20)).

StarkWare's own posts don't address the pool:

- The [quantum roadmap (2026-06-30)](https://starkware.co/blog/the-architecture-advantage-starknets-quantum-readiness-roadmap/) lists the remaining elliptic-curve dependencies as Pedersen hashing, the bridge's secp256k1/r1 syscalls and blob KZG. It doesn't mention the privacy pool's ECDH.
- [Starknet's post on quantum resistance (2026-08-07)](https://www.starknet.io/blog/quantum-resistance/) describes "harvest now, decrypt later" only in general terms.

**Unconfirmed:** whether StarkWare plans post-quantum encryption for the pool.

## Zcash

The spec is [protocol.pdf v2026.9.0-13, 2026-11-11](https://zips.z.cash/protocol/protocol.pdf), cited as "spec §".

### What it is and what it reveals

**Key structure** (spec §3.1, §4.2.2, §4.2.3):

- **Sapling.** The FVK is `(ak, nk, ovk)`, and the ivk is derived from it.
- **Orchard, and Ironwood (which uses the same Orchard protocol).** The FVK is `(ak, nk, rivk)`, and from it come the ivk (`dk`, `ivk`) and the ovk.
- **Diversified addresses.** All of an account's diversified addresses share one ivk and FVK.

**What each key reveals.** [ZIP 310](https://zips.z.cash/zip-0310) (Draft) documents this for Sapling:

- **ivk:** incoming notes, the diversified address each was paid to, and the amount. The memo is "UNVERIFIED".
- **FVK:** additionally, when the account's notes are spent (via the nullifier). Through the ovk, it also shows each outgoing payment's recipient address, amount and memo, plus a guaranteed lower bound on the balance.

**Encodings:** UFVK `uview…` and UIVK `uivk…` ([ZIP 316](https://zips.z.cash/zip-0316)), and Sapling extended FVK `zxviews…` ([ZIP 32](https://zips.z.cash/zip-0032)). Sprout is legacy and I left it out.

### Who holds it

Mainly the user. Handing it to an auditor is the documented use.

- **ECC's blog** ([2020-05-18](https://zodl.com/explaining-viewing-keys-2/)) says: "A custodian needs to provide visibility of their Zcash holdings to auditors". It also covers exchanges doing due diligence, and regulators "where appropriate".
- **ZIP 310** gives auditing, and splitting authority across devices, as motivations.
- **For a single payment,** the tool is a payment disclosure instead ([ZIP 311](https://zips.z.cash/zip-0311), Draft).

### How it is derived and shared

- **Derivation.** Keys come from the wallet seed by ZIP 32 hierarchical derivation (`m/32'/133'/account'`).
- **Sharing.** It happens off-chain with no protocol channel. In ECC's words, "it can only be obtained from someone who holds it". The key never goes on-chain.
- **No auditor data on-chain.**

### Cryptography

Note encryption (spec §4.20, §5.4.3, §5.4.5):

1. `epk = [esk]·g_d`, and the shared secret is `[esk]·pk_d`.
2. The KDF is BLAKE2b-256, personalised `Zcash_SaplingKDF` or `Zcash_OrchardKDF`.
3. The cipher is AEAD_CHACHA20_POLY1305 with a zero nonce.
4. The curve is Jubjub for Sapling and Pallas for Orchard and Ironwood.

The outgoing ciphertext uses a symmetric key, `ock = PRF^ock_ovk(cv, cm, epk)`.

### Post-quantum status

Zcash is post-quantum private only while addresses stay secret. The project says so itself:

- **Spec §8.7.** Breaking ECDH on Jubjub or Pallas "would not help to decrypt the transmitted note(s) ciphertext unless pkenc or pkd is known or guessed". The same section also says: "upgrading the encryption algorithm would not prevent a future adversary from attempting to decrypt ciphertexts encrypted before the upgrade."
- **[ZIP 326](https://zips.z.cash/zip-0326)** (Hopwood, Draft, 2026-06-30): "a quantum adversary, which can recover the ivk from the published (diversified) address — although it cannot feasibly recover the nullifier key". Since `pk_d = [ivk]·g_d`, one known address yields the ivk, and that ivk decrypts every incoming note to all of the account's diversified addresses (spec §3.1). The ovk is a 256-bit symmetric key (spec §8.7), so outgoing notes and spends stay hidden.
- **[Issue zcash/zcash#6121](https://github.com/zcash/zcash/issues/6121)** (daira, 2022): "If addresses are kept secret then Zcash is already intended to be post-quantum private."
- **[ZIP 2005](https://zips.z.cash/zip-2005)** (Final). It created the Ironwood pool, which activated on Mainnet on 2026-07-28 at block 3428143 (spec §6). It makes *funds* recoverable after a quantum break, and explicitly does not address *privacy*: "It is not required to address discrete-logarithm-breaking or quantum attacks on privacy". Privacy "would be retained … against post-quantum adversaries without knowledge of the notes' addresses."

## Privacy Pools (0xbow)

There are two generations, and only v2 has a viewing key.

- **v1** is in [privacy-pools-core @ df4bf73](https://github.com/0xbow-io/privacy-pools-core/tree/df4bf730214bf9d0c717a9258f7a74861758c269).
- **v2** is in [privacy-pools-v2-monorepo @ 61fac03](https://github.com/0xbow-io/privacy-pools-v2-monorepo/tree/61fac03acd1fc306164ddc234f7fac4147d04493), with docs at [docs.privacypools.com](https://docs.privacypools.com). v2 runs in production on Ethereum mainnet, BNB Chain and Citrea, among others ([deployments](https://docs.privacypools.com/deployments/mainnet)), and supports USDC.

### v1: no viewing key

**How v1 works:**

- **Deposit secrets.** The `nullifier` and `secret` come from a mnemonic ([`crypto.ts` L39](https://github.com/0xbow-io/privacy-pools-core/blob/df4bf730214bf9d0c717a9258f7a74861758c269/packages/sdk/src/crypto.ts#L39)). The commitment is `Poseidon(value, label, Poseidon(nullifier, secret))`.
- **Deposits are public.** The `Deposited` event records the depositor, label, value and precommitment ([`IPrivacyPool.sol` L39](https://github.com/0xbow-io/privacy-pools-core/blob/df4bf730214bf9d0c717a9258f7a74861758c269/packages/contracts/src/interfaces/IPrivacyPool.sol#L39)).
- **Compliance.** The ASP (0xbow) screens deposits and publishes a root of approved labels.
- **Ragequit.** A depositor can always exit publicly back to the original address ([ragequit docs](https://docs.privacypools.com/operations/ragequit)).

**What fills the viewing key's role:** the deposit secrets, the ASP, and ragequit.

**Quantum.** There is no ciphertext on-chain, so there's no ECDH to break. My analysis, not a 0xbow statement: Shor gives no route to deanonymize v1.

**Unconfirmed:** the [v1-vs-v2 page](https://docs.privacypools.com/introduction/v1-vs-v2) says v1 users "can generate viewing keys to reveal account activity". I found no viewing-key code in the v1 repo.

### v2: what the viewing key is and what it reveals

- **What it unlocks.** `viewingPrivateKey` "decrypts incoming note payloads. An attacker who obtains it sees your incoming receive history but still cannot spend" ([keys](https://docs.privacypools.com/concepts/keys)).
- **What a payload holds.** Each payload is `noteSecret, value, tokenId, label`, and change notes are encrypted to yourself too ([`user-flows.md`](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/docs/tech-design/user-flows.md)).
- **What it doesn't show.** The docs say it "doesn't disclose outgoing transfers" ([disclose viewing key](https://docs.privacypools.com/operations/disclose-viewing-key)).
- **Single payments.** To show one payment, the user gives the auditor a per-payment receipt, which is that note's `noteSecret` ([selective disclosure](https://docs.privacypools.com/concepts/selective-disclosure)).

### v2: who holds it

The user. The docs say: "Provide your `viewingPrivateKey` to a third-party recipient like an auditor, accountant, or regulator… There is no 'un-share.'" ([disclose viewing key](https://docs.privacypools.com/operations/disclose-viewing-key)).

The ASP never receives viewing keys. Instead it gets each deposit's opening, encrypted to it ([ASP attestation](https://docs.privacypools.com/concepts/asp-attestation)).

A Bankless launch report says v2 has "no KYC and no viewing key" ([Bankless, 2026-10-21](https://www.bankless.com/read/news/privacy-pools-v2-goes-live-with-bigger-feature-suite)). 0xbow's own docs show a user-held viewing key, so that line likely means there is no compliance-mandated viewing key.

### v2: how it is derived and shared

**Derivation.** It follows a two-stage HKDF-SHA256 chain ([`crypto-service.md` L116](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/docs/tech-design/evm-sdk/crypto-service.md#L116)):

1. Start from the `r` value of the user's EIP-712 signature.
2. Run HKDF-SHA256 over it, then expand along the `"VIEWING_KEY"` branch.
3. Clamp the result into an X25519 private key.

**What goes on-chain.** The public key is published through `Keystore.setViewingKey(bytes32)`, which emits `ViewingKeySet` ([`Keystore.sol` L122](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/packages/contracts/src/contracts/Keystore.sol#L122)). The private key is shared off-chain; the docs don't specify a channel.

### v2: cryptography

**Each note:**

1. The sender makes a fresh ephemeral X25519 key.
2. The symmetric key is `sha256(shared)`.
3. The payload is encrypted with XChaCha20-Poly1305.
4. The result is emitted on-chain as `Note(hint, ephemeralPub ‖ ciphertext)`.

See [`NoteComputationService.ts` L242](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/packages/core-sdk/src/services/NoteComputationService.ts#L242) and [`AbstractCryptoService.ts` L78, L216](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/packages/core-sdk/src/services/AbstractCryptoService.ts#L216).

**Compliance data on-chain.** Each deposit's opening `{noteAddressHash, tokenId, value, depositSecret, metadata}` is encrypted with ephemeral X25519 to the ASP's public key, and emitted as `LabelRegistered(ciphertext)` ([`user-flows.md` L420](https://github.com/0xbow-io/privacy-pools-v2-monorepo/blob/61fac03acd1fc306164ddc234f7fac4147d04493/docs/tech-design/user-flows.md#L420)). The docs publish the production ASP key as `0x3f65…8f34` ([deployments](https://docs.privacypools.com/deployments/mainnet)).

### v2: post-quantum status

Not post-quantum. Shor breaks X25519, and two paths need only public data:

1. **The viewing key path.** A Keystore viewing public key yields that user's `viewingPrivateKey`. That decrypts "every incoming note ever encrypted to you, past and future" ([threat model](https://docs.privacypools.com/introduction/threat-model)).
2. **The ASP key path.** The ASP's published public key yields every deposit opening ever registered.

My inference, **unconfirmed**: the labels inside decrypted notes could be matched against labels computed from the ASP openings. That would link deposits to recipients.

Out-of-band notes, sent to recipients who never registered, put no ciphertext on-chain. The v2 docs have no mention of "quantum".

## Lines for the video

**What gets exposed.** The best name is **"payment history"**.

- "Auditor commitment" isn't a term in any of the three protocols.
- Note commitments are not what leaks.
- For STRK20 only, "every viewing key" is also exact.

**If the chat is shown inside pq.** A viewing key sent through pq is Kyber512-encrypted. The 🔒 ECDH tag only fits STRK20's on-chain escrow, or a non-pq channel.

### Verdicts

| # | Line | Verdict | Reason |
| --- | --- | --- | --- |
| 1 | alice.eth: "Sent you 100 USDC, privately 🤫" | Accurate | Private USDC is live on STRK20 and Privacy Pools v2. Zcash has no USDC. |
| 2 | bob.eth: "Got it! My auditor needs the viewing key 🧾" | Misleading | You disclose your *own* key. Alice's key wouldn't show her sent payment in Privacy Pools v2; a receipt would. In STRK20 the auditor already holds it. |
| 3 | alice.eth: "🔑 viewing key: vk_7f3a…e1c9", tagged "🔒 ECDH-encrypted" | Misleading | Only STRK20 puts the viewing key itself on-chain, ECDH-encrypted to the auditor. Zcash and Privacy Pools share it off-chain. `vk_` is no real format. |
| 4 | "⚛️ A quantum computer joined the chat", and the tag flips to "🔓 decrypted" | Accurate | Shor on the Stark curve or X25519 decrypts recorded ciphertexts later. Zcash also needs the address. |
| 5 | "Private payment viewing keys aren't post-quantum secure." | Misleading | The keys aren't the weak point. The ECDH that encrypts notes (and STRK20's escrowed key) is. |
| 6 | "One day, every auditor commitment becomes public." | Wrong | No protocol has "auditor commitments". "Every" overstates it for Zcash, which needs your address. |

### Proposed lines (≤ 9 words each)

These track STRK20 literally, and are true in spirit for the other two.

1. alice.eth: **"Sent you 100 USDC, privately 🤫"** (unchanged)
2. bob.eth: **"Got it! My auditor gets my viewing key 🧾"**
3. bob.eth: **"🔑 Viewing key, sealed to the auditor on-chain"**, tagged **"🔒 ECDH-encrypted"**
4. System: **"⚛️ Years later, a quantum computer reads the chain"**, and the tag flips to **"🔓 decrypted"**
5. Caption: **"Private payments rely on encryption quantum computers can break."**
6. Caption: **"Recorded today, readable later: your payment history."**

To stay neutral across protocols, keep line 3 as a plain hand-off: **"🔑 Here's my viewing key"**. Then move the 🔒/🔓 tag onto Alice's payment bubble as **"🔒 ECDH-encrypted on-chain"**. That framing is true of all three, with the Zcash caveat that the attacker needs the address.
