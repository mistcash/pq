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

type decompressMessageCircuit struct {
	Msg [2]frontend.Variable
	Out circuit.Poly
}

func (c *decompressMessageCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	p := circuit.DecompressMessage(api, f, c.Msg)
	assertEq(f, &p, &c.Out)
	return nil
}

func TestDecompressMessage(t *testing.T) {
	pt := make([]byte, math.PlaintextSize)
	rand.Read(pt)
	var m math.Poly
	m.DecompressMessage(pt)
	msg := native.MsgOf(pt)
	w := decompressMessageCircuit{[2]frontend.Variable{msg[0], msg[1]}, native.PolyOf(m, false)}
	if err := test.IsSolved(&decompressMessageCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}
