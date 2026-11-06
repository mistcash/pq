package native

import "github.com/cloudflare/circl/pke/kyber/kyber512/math"

// EncryptUV mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/kyber512/internal/cpapke.go#L135-L175 without CompressTo.
func EncryptUV(pk *math.PK, pt []byte, r, e1 math.Vec, e2 math.Poly) (u math.Vec, v math.Poly) {
	rh := r
	rh.NTT()
	rh.BarrettReduce()

	aT, th := pk.AT(), pk.Th()
	for i := range math.K {
		math.PolyDotHat(&u[i], &aT[i], &rh)
	}
	u.BarrettReduce()
	u.InvNTT()
	u.Add(&u, &e1)

	var m math.Poly
	math.PolyDotHat(&v, &th, &rh)
	v.BarrettReduce()
	v.InvNTT()
	m.DecompressMessage(pt)
	v.Add(&v, &m)
	v.Add(&v, &e2)

	u.Normalize()
	v.Normalize()
	return
}
