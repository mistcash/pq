package native

import "github.com/cloudflare/circl/pke/kyber/kyber512/math"

// DecryptUV mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/kyber512/internal/cpapke.go#L111-L128 without Decompress.
func DecryptUV(sk *math.SK, u math.Vec, v math.Poly) []byte {
	var m math.Poly
	sh := sk.Sh()
	u.NTT()
	math.PolyDotHat(&m, &sh, &u)
	m.BarrettReduce()
	m.InvNTT()
	m.Sub(&v, &m)
	m.Normalize()

	pt := make([]byte, math.PlaintextSize)
	m.CompressMessageTo(pt)
	return pt
}
