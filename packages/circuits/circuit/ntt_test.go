package circuit_test

import (
	"testing"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

type nttCircuit struct{ In, Out circuit.Poly }

func (c *nttCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	p := circuit.NTT(f, &c.In)
	assertEq(f, &p, &c.Out)
	return nil
}

func TestNTT(t *testing.T) {
	p := randPoly()
	w := nttCircuit{In: native.PolyOf(p, false)}
	p.NTT()
	w.Out = native.PolyOf(p, true)
	if err := test.IsSolved(&nttCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}
