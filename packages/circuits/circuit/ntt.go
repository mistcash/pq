package circuit

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
)

// NTT is FIPS 203 Alg. 9; mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/ntt.go#L60
func NTT(f *F, p *Poly) Poly {
	a, k := *p, 1
	for l := math.N / 2; l >= 2; l /= 2 {
		for s := 0; s < math.N; s += 2 * l {
			z := big.NewInt(Zetas[k])
			k++
			for j := s; j < s+l; j++ {
				t := f.MulConst(&a[j+l], z)
				a[j+l] = *f.Sub(&a[j], t)
				a[j] = *f.Add(&a[j], t)
			}
		}
	}
	return a
}
