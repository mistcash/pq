package circuit

import "github.com/consensys/gnark/frontend"

// Encrypt is Kyber round-3 Alg. 5 CPAPKE.Enc without compression; mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/kyber512/internal/cpapke.go#L135-L175
func Encrypt(api frontend.API, f *F, AT *Mat, Th *Vec, msg [2]frontend.Variable, r, e1 *Vec, e2 *Poly) (u Vec, v Poly) {
	var rh Vec
	for i := range r {
		rh[i] = NTT(f, &r[i])
		for j := range rh[i] {
			rh[i][j] = *f.Reduce(&rh[i][j]) // r̂ feeds K+1 DotHats: reduce once, not per use
		}
	}
	for i := range u {
		u[i] = DotHat(f, &AT[i], &rh)
		u[i] = InvNTT(f, &u[i])
		u[i] = Add(f, &u[i], &e1[i])
	}
	v = DotHat(f, Th, &rh)
	v = InvNTT(f, &v)
	m := DecompressMessage(api, f, msg)
	v = Add(f, &v, &m)
	v = Add(f, &v, e2)
	return
}
