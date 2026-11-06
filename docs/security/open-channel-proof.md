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
