package native

import (
	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/frontend"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

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

// Witness is the full circuit.EncCircuit assignment for encrypting pt to pk with the noise of seed.
func Witness(pk *math.PK, pt, seed []byte) circuit.EncCircuit {
	r, e1, e2 := Noise(seed)
	u, v := EncryptUV(pk, pt, r, e1, e2)
	msg := MsgOf(pt)
	return circuit.EncCircuit{
		AT: MatOf(pk.AT()), Th: VecOf(pk.Th(), true), Msg: [2]frontend.Variable{msg[0], msg[1]},
		R: VecOf(r, false), E1: VecOf(e1, false), E2: PolyOf(e2, false),
		U: VecOf(u, false), V: PolyOf(v, false),
	}
}
