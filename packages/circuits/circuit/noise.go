package circuit

import (
	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/frontend"
)

// AssertNoise asserts every coefficient of p, held reduced as native.PolyOf assigns it, is in [-eta, eta] mod q:
// the range of circl's DeriveNoise (CBD_eta, FIPS 203 Alg. 8). Its limb x < 2^12 is a root of ∏_k (x − k mod q).
func AssertNoise(api frontend.API, f *F, p *Poly, eta int) {
	for i := range p {
		x := f.Reduce(&p[i]).Limbs[0]
		z := frontend.Variable(1)
		for k := -eta; k <= eta; k++ {
			z = api.Mul(z, api.Sub(x, (k+int(math.Q))%int(math.Q)))
		}
		api.AssertIsEqual(z, 0)
	}
}
