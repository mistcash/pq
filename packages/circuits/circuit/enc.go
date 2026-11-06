package circuit

import (
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
)

// EncCircuit asserts Encrypt == (U, V); U, V are the last fields, so their limbs end the witness vector.
type EncCircuit struct {
	AT    Mat
	Th    Vec
	Msg   [2]frontend.Variable
	R, E1 Vec
	E2    Poly
	U     Vec
	V     Poly
}

func (c *EncCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[Params](api)
	if err != nil {
		return err
	}
	u, v := Encrypt(api, f, &c.AT, &c.Th, c.Msg, &c.R, &c.E1, &c.E2)
	for i := range u {
		for j := range u[i] {
			f.AssertIsEqual(&u[i][j], &c.U[i][j])
		}
	}
	for j := range v {
		f.AssertIsEqual(&v[j], &c.V[j])
	}
	return nil
}

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
