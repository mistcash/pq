# The OpenChannel proof, and how post-quantum pqmsg is

What the `OpenChannel` proof checks, which parts of ML-KEM it covers, and how secure pqmsg is overall, as of `8b3a1c3`. Terms are as in `GLOSSARY.md`.

- The proof shows the opener knows the Channel Key behind the Channel Key Hash. It doesn't show that the Encrypted Channel Key encrypts that Channel Key to anyone: the circuit accepts any well-formed Encrypted Channel Key.
- The circuit covers K-PKE.Encrypt's arithmetic, but none of the key binding, sampling, compression or KEM layer.
- Uncompressed, Kyber512 gives Encrypted Channel Keys about 112 bits of core-SVP hardness, just above NIST level 1.
- pqmsg isn't post-quantum end to end: every key derives from a secp256k1 wallet signature, which a quantum attacker can recompute.

## What the proof checks

[`OpenChannel`](../../packages/circuits/circuits.go#L39) proves:

```text
∃ k, Â, t̂, r, e₁, e₂ such that
  Poseidon2(k) = Channel Key Hash
  r ∈ [−3, 3]⁵¹², e₁ ∈ [−2, 2]⁵¹², e₂ ∈ [−2, 2]²⁵⁶
  Encrypted Channel Key = Pack(NTT⁻¹(Âᵀ ∘ NTT(r)) + e₁,  NTT⁻¹(t̂ᵀ ∘ NTT(r)) + e₂ + ⌈q/2⌉·bits(k))
```

The recipient's key (Âᵀ and t̂, the witnesses `AT` and `Th`) is private, and nothing constrains it: it isn't tied to a registered User Key, and Â isn't derived from ρ. So for any target (u, v), the prover can pick:

```text
r = (1, 0),  e₁ = e₂ = 0
Âᵀ[i][0] = NTT(u[i]),  Âᵀ[i][1] = 0
t̂[0] = NTT(v − Decompress₁(k)),  t̂[1] = 0
```

NTT(1) is the identity under ∘, so u[i] = NTT⁻¹(Âᵀ[i][0]) and v = NTT⁻¹(t̂[0]) + Decompress₁(k) hit the targets.

We checked this with `test.IsSolved`. The forged witness satisfies `OpenChannel` for random targets and for the all-zero Encrypted Channel Key. The forged Encrypted Channel Keys decrypt to junk under real User Keys. Changing one coefficient of the public input makes the same witness fail.

So the proof only ensures:

1. **The opener knows the Channel Key behind the Channel Key Hash.** Nobody can open a Channel under a Channel Key Hash whose Channel Key they don't know, except by replaying an existing opening: `openChannel` accepts duplicates, and only the Fixed Sender's route refuses them.
2. **The Encrypted Channel Key is well formed:** 768 coefficients, each below q, 21 to a field element.
3. **Nothing private leaks.** Groth16 is perfectly zero-knowledge, so the proof hides the Channel Key, the User Key and the noise, even from a quantum adversary.

_Contradicts ADR-0003_, which says "the proof only shows the Channel Key was encrypted to some Kyber512 key". That "key" can be any (Â, t̂), including ones no secret key decrypts, so the encryption check adds nothing. ADR-0003's conclusion still roughly holds: a bad Encrypted Channel Key mostly breaks its sender's own Channel.

## Which parts of ML-KEM the circuit covers

The circuit mirrors round-3 Kyber512's CPAPKE.Enc, which is ML-KEM-512's K-PKE.Encrypt (k = 2, η₁ = 3, η₂ = 2). Algorithm numbers are [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf)'s.

**In the circuit:**

- K-PKE.Encrypt's arithmetic (Alg. 14): NTT (Alg. 9), NTT⁻¹ (Alg. 10), MultiplyNTTs and BaseCaseMultiply (Alg. 11, 12), for Âᵀ ∘ r̂ and t̂ᵀ ∘ r̂.
- Decompress₁ of the message bits, and polynomial addition.
- Range checks on r, e₁ and e₂: their range, not their distribution.
- Canonical packing of u‖v into 37 field elements.
- Poseidon2 binding the plaintext to the Channel Key Hash.

**Skipped:**

- SampleNTT (Alg. 7): Â isn't expanded from ρ.
- ByteDecode₁₂ (Alg. 6) of the User Key, and any binding to a registered User Key: t̂ is free.
- SamplePolyCBD (Alg. 8) and PRF: the noise isn't derived from a seed.
- Compress and ByteEncode (Alg. 5): Encrypted Channel Keys are uncompressed.
- The KEM layer (Alg. 16–21): Encaps, Decaps, the Fujisaki–Okamoto transform, implicit rejection and H(ek). pqmsg uses K-PKE alone, so it's only CPA-secure.
- K-PKE.Decrypt (Alg. 15): recipients decrypt natively, and nothing proves it.
- K-PKE.KeyGen's (Alg. 13) domain separator: User Keys come from round-3 Kyber key generation, G(seed) rather than G(d‖k). `register` does FIPS 203 §7.2's type check (the length) but not its modulus check. Neither weakens security. User Keys use ML-KEM-512's encoding, but ML-KEM-512.KeyGen wouldn't produce the same User Key from the same seed.

## Security by layer

### Kyber512

The [round-3 Kyber spec](https://www.pq-crystals.org/kyber/data/kyber-specification-round3-20210131.pdf) (§1.5) says that without the rounding noise from compression, "the public keys are protected with 118 bits, and the ciphertexts with 112" of core-SVP hardness. Kyber512 reaches 118 everywhere only "with a weak version of the LWR assumption". pqmsg doesn't compress, so Encrypted Channel Keys get no rounding noise. The spec's 112 is a conservative bound for that case: it treats r as if drawn with η₂ = 2, and r's actual η₁ = 3 makes attacks a little harder (§4.4).

| | Classical core-SVP | Quantum core-SVP | Refined estimate |
| --- | --- | --- | --- |
| Kyber512, compressed, weak LWR (Table 4) | 118 | 107 | 2¹⁵¹·⁵ gates |
| pqmsg's Encrypted Channel Key | ≥ 112 | ≳ 102 | ≳ 2¹⁴⁵ gates (§4.4) |

NIST level 1 needs 2¹⁴³ gates (§5.2), so the margin is thin. The quantum figure is our scaling of the spec's, not the spec's own. Kyber512's level-1 margin is [debated](https://groups.google.com/a/list.nist.gov/g/pqc-forum/c/NSe0wAzKJtA) even with compression.

Recipient anonymity also rests on MLWE: Encrypted Channel Keys look random, so they don't reveal their User Key.

### Key derivation

This is the biggest gap. The Sender Key is Poseidon2 of a wallet signature over a fixed message, and ADR-0002 requires the wallet to sign deterministically. `register` is sent from the User's own wallet, so their secp256k1 public key is on-chain. A quantum attacker can:

1. recover the wallet's private key with Shor's algorithm,
2. sign the fixed message again, getting the same signature,
3. derive the Sender Key, then the User Key's secret key and every Channel Key the User opened,
4. read every message to and from that User, all of which stay on-chain.

So "harvest now, decrypt later" works against every User: confidentiality is only as post-quantum as secp256k1.

### Poseidon2

The Sender Key, User Key seed, Channel Keys, Message Keys, Message IDs and message pads all use Poseidon2 over BN254. Its 254-bit outputs give about 127 bits against Grover. It's newer, and less studied, than SHA-3.

### Groth16 on BN254

- The setup is dev-only and single-party (`groth16.Setup` in `cmd/artifacts`), so whoever ran it could forge proofs.
- Soundness is classical only: BN254 gives about 100 bits, and Shor breaks it.
- A forged proof adds little, given how little the circuit checks: it lets someone open a Channel under a Channel Key Hash whose Channel Key they don't know.
- Zero-knowledge is perfect, so it holds against quantum adversaries too.

### Outside the proof

- **Sender misattribution by replay.** The proof doesn't cover the Encrypted Sender, which is the sender's User Index + H(Channel Key, tag), so adding δ to it shifts the User Index it decrypts to. Anyone can resubmit an open Channel with Encrypted Sender + δ. [`restore`](../../packages/nextjs/hooks/useOpenChannel.ts#L84) then also files the same Channel Key under User Index s + δ, if that User exists. The recipient sees the Channel as from both Users, and it can overwrite a genuine Channel from User s + δ. The attacker doesn't know s, so they can shift the sender but can't choose them.
- **Message ID squatting.** `post` accepts any unused Message ID from anyone. Someone who sees a pending `post` can front-run it with the same Message ID and junk. The real `post` reverts, and both ends see the junk as a garbled message, since nothing authenticates it. A resend goes to the next Message Index, so the attacker can keep doing this.
- **No CCA security.** User Keys are static and long-lived, and pqmsg uses CPA encryption without the Fujisaki–Okamoto transform. If a recipient's reaction to a Channel ever becomes observable (auto-replies, read receipts), known key-mismatch attacks on CPA Kyber can recover their secret key. Since the proof accepts any Encrypted Channel Key, crafting those queries costs only gas.

## Overall

The proof gives integrity and some friction against spam, not confidentiality. Confidentiality comes from Kyber512 at about 112 bits of core-SVP hardness, capped by the secp256k1-derived Sender Key. pqmsg isn't post-quantum end to end yet.

## Fixes, by impact

1. **A Sender Key the wallet key can't recompute.** Mix in a secret the wallet doesn't hold, such as a random seed the User backs up. This trades away ADR-0002's "nothing to back up".
2. **Bind the User Key in the circuit.** Commit to registered User Keys, for example with a Merkle root of their hashes as a public input, and prove membership; the recipient stays hidden. One system-wide matrix A, as circuit constants, would make this cheaper by leaving only t̂ to commit. A system-wide A changes User Keys, so Users would register again. Existing Channels stay readable as long as the secret key is still derived the same way, since decrypting needs only that.
3. **Prove the Encrypted Sender, and have `openChannel` refuse a Channel Key Hash it already has.**
4. **Compress the Encrypted Channel Key** (d_u = 10, d_v = 4) to reach the spec's 118 bits under its weak-LWR assumption, at the cost of proving the compression.
