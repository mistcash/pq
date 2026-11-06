package native

import "github.com/cloudflare/circl/pke/kyber/kyber512/math"

// Noise mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/kyber512/internal/cpapke.go#L139-L145 with r left in the normal domain.
func Noise(seed []byte) (r, e1 math.Vec, e2 math.Poly) {
	r.DeriveNoise(seed, 0, math.Eta1)
	e1.DeriveNoise(seed, math.K, math.Eta2)
	e2.DeriveNoise(seed, 2*math.K, math.Eta2)
	return
}
