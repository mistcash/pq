package circuit

import "github.com/cloudflare/circl/pke/kyber/kyber512/math"

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
