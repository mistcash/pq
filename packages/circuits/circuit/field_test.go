package circuit_test

import (
	"testing"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

type mulCircuit struct{ A, B, C circuit.El }

func (c *mulCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	f.AssertIsEqual(f.Mul(&c.A, &c.B), &c.C)
	return nil
}

func TestField(t *testing.T) {
	w := mulCircuit{
		emulated.ValueOf[circuit.Params](1234),
		emulated.ValueOf[circuit.Params](2345),
		emulated.ValueOf[circuit.Params](1234 * 2345 % 3329),
	}
	if err := test.IsSolved(&mulCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}
