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

type packCircuit struct {
	U circuit.Vec
	V circuit.Poly
	C [circuit.CiphertextElements]frontend.Variable
}

func (c *packCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	for i, x := range circuit.Pack(api, f, &c.U, &c.V) {
		api.AssertIsEqual(x, c.C[i])
	}
	return nil
}

func TestPack(t *testing.T) {
	ks, seed, pt := make([]byte, math.SeedSize), make([]byte, math.SeedSize), make([]byte, math.PlaintextSize)
	rand.Read(ks)
	rand.Read(seed)
	rand.Read(pt)
	pk, _ := math.NewKeyPair(ks)
	r, e1, e2 := native.Noise(seed)
	u, v := native.EncryptUV(pk, pt, r, e1, e2)
	u[0][0] = 0
	w := packCircuit{U: native.VecOf(u, false), V: native.PolyOf(v, false)}
	w.U[0][0] = emulated.ValueOf[circuit.Params](math.Q) // 0, held as q: Pack reduces it as Normalize does
	ct := native.PackCiphertext(u, v)
	for i := range ct {
		w.C[i] = ct[i]
	}
	if err := test.IsSolved(&packCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
	v[math.N-1] = (v[math.N-1] + 1) % math.Q // the last coefficient, alone in the last element
	w.V = native.PolyOf(v, false)
	if test.IsSolved(&packCircuit{}, &w, ecc.BN254.ScalarField()) == nil {
		t.Fatal("tampered v accepted")
	}
}
