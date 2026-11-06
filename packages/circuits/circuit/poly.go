package circuit

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
)

// Poly is an element of R_q = Z_q[X]/(X^256 + 1).
type Poly [math.N]El

// Vec is a vector in R_q^k.
type Vec [math.K]Poly

// Mat is a k×k matrix over R_q.
type Mat [math.K]Vec

// Add mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/poly.go#L13
func Add(f *F, a, b *Poly) (p Poly) {
	for i := range p {
		p[i] = *f.Add(&a[i], &b[i])
	}
	return
}

// MulHat is FIPS 203 Alg. 11/12; mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/poly.go#L63
func MulHat(f *F, a, b *Poly) (p Poly) {
	for i := 0; i < math.N; i += 2 {
		z := big.NewInt(Zetas[64+i/4])
		if i%4 != 0 {
			z.Neg(z)
		}
		p[i] = *f.Add(f.MulNoReduce(&a[i], &b[i]), f.MulConst(f.MulNoReduce(&a[i+1], &b[i+1]), z))
		p[i+1] = *f.Add(f.MulNoReduce(&a[i], &b[i+1]), f.MulNoReduce(&a[i+1], &b[i]))
	}
	return
}
