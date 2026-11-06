package circuit_test

import (
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

type dotHatCircuit struct {
	A, B circuit.Vec
	C    circuit.Poly
}

func (c *dotHatCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	p := circuit.DotHat(f, &c.A, &c.B)
	assertEq(f, &p, &c.C)
	return nil
}

func TestDotHat(t *testing.T) {
	var a, b math.Vec
	for i := range a {
		a[i], b[i] = randPoly(), randPoly()
	}
	a.NTT()
	a.BarrettReduce()
	b.NTT()
	b.BarrettReduce()
	var c math.Poly
	math.PolyDotHat(&c, &a, &b)
	c.ToMont()
	var w dotHatCircuit
	for i := range a {
		w.A[i], w.B[i] = native.PolyOf(a[i], true), native.PolyOf(b[i], true)
	}
	w.C = native.PolyOf(c, true)
	if err := test.IsSolved(&dotHatCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}
