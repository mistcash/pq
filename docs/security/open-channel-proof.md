# The OpenChannel proof, and how post-quantum pqmsg is

What the `OpenChannel` proof checks, which parts of ML-KEM it covers, and how secure pqmsg is overall, as of `8b3a1c3`. Terms are as in `GLOSSARY.md`.

## What the proof checks

[`OpenChannel`](../../packages/circuits/circuits.go#L39) proves:

```text
∃ k, Â, t̂, r, e₁, e₂ such that
  Poseidon2(k) = Channel Key Hash
  r ∈ [−3, 3]⁵¹², e₁ ∈ [−2, 2]⁵¹², e₂ ∈ [−2, 2]²⁵⁶
  Encrypted Channel Key = Pack(NTT⁻¹(Âᵀ ∘ NTT(r)) + e₁,  NTT⁻¹(t̂ᵀ ∘ NTT(r)) + e₂ + ⌈q/2⌉·bits(k))
```

The User Key (`AT`, `Th`) is a private witness that nothing constrains: it isn't tied to a registered User Key, and Â isn't derived from ρ. So for any target (u, v), the prover can pick:

```text
r = (1, 0),  e₁ = e₂ = 0
Â[i][0] = NTT(u[i]),  Â[i][1] = 0
t̂[0] = NTT(v − Decompress₁(k)),  t̂[1] = 0
```

NTT(1) is the identity under ∘, so u = NTT⁻¹(Â[i][0]) and v = NTT⁻¹(t̂[0]) + Decompress₁(k) hit the targets.

We checked this with `test.IsSolved`. The forged witness satisfies `OpenChannel` for random targets and for the all-zero Encrypted Channel Key. The forged Encrypted Channel Keys decrypt to junk under real User Keys. Changing one coefficient of the public input makes the same witness fail.

So the proof only ensures:

1. **The opener knows the Channel Key behind the Channel Key Hash.** Nobody can open a Channel under a Channel Key Hash they can't open, except by replaying an existing opening: `openChannel` accepts duplicates, and only the Fixed Sender's route refuses them.
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
- SamplePolyCBD and PRF (Alg. 8): the noise isn't derived from a seed.
- Compress and ByteEncode (Alg. 5): Encrypted Channel Keys are uncompressed.
- The KEM layer (Alg. 16–21): Encaps, Decaps, the Fujisaki–Okamoto transform, implicit rejection and H(ek). pqmsg uses K-PKE alone, so it's only CPA-secure.
- K-PKE.Decrypt (Alg. 15): recipients decrypt natively, and nothing proves it.
- K-PKE.KeyGen's (Alg. 13) domain separator: User Keys come from round-3 Kyber key generation, G(seed) rather than G(d‖k). `register` checks only a User Key's length, not FIPS 203 §7.2's encapsulation key check. Neither weakens security, but User Keys aren't byte-compatible with ML-KEM-512's.
