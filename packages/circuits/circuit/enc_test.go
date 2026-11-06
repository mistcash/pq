package circuit_test

import (
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

type encCircuit struct {
	AT    circuit.Mat
	Th    circuit.Vec
	Msg   [2]frontend.Variable
	R, E1 circuit.Vec
	E2    circuit.Poly
	U     circuit.Vec
	V     circuit.Poly
}

func (c *encCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	u, v := circuit.Encrypt(api, f, &c.AT, &c.Th, c.Msg, &c.R, &c.E1, &c.E2)
	for i := range u {
		assertEq(f, &u[i], &c.U[i])
	}
	assertEq(f, &v, &c.V)
	return nil
}

func TestEncrypt(t *testing.T) {
	ks, seed, pt := make([]byte, math.SeedSize), make([]byte, math.SeedSize), make([]byte, math.PlaintextSize)
	rand.Read(ks)
	rand.Read(seed)
	rand.Read(pt)
	pk, _ := math.NewKeyPair(ks)
	r, e1, e2 := native.Noise(seed)
	u, v := native.EncryptUV(pk, pt, r, e1, e2)
	msg := native.MsgOf(pt)
	w := encCircuit{
		native.MatOf(pk.AT()), native.VecOf(pk.Th(), true), [2]frontend.Variable{msg[0], msg[1]},
		native.VecOf(r, false), native.VecOf(e1, false), native.PolyOf(e2, false),
		native.VecOf(u, false), native.PolyOf(v, false),
	}
	if err := test.IsSolved(&encCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
	v[0] = (v[0] + 1) % math.Q
	w.V = native.PolyOf(v, false)
	if test.IsSolved(&encCircuit{}, &w, ecc.BN254.ScalarField()) == nil {
		t.Fatal("tampered v accepted")
	}
}
