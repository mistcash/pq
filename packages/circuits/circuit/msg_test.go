package circuit_test

import (
	"crypto/rand"
	"math/big"
	"slices"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
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

type msgOfCircuit struct {
	X   frontend.Variable
	Msg [2]frontend.Variable
}

func (c *msgOfCircuit) Define(api frontend.API) error {
	m := circuit.MsgOf(api, c.X)
	api.AssertIsEqual(m[0], c.Msg[0])
	api.AssertIsEqual(m[1], c.Msg[1])
	return nil
}

func TestMsgOf(t *testing.T) {
	var r1, x fr.Element
	r1.SetString("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000") // r - 1, all 254 bits
	x.SetRandom()
	for _, x := range []fr.Element{r1, x} {
		pt := x.Bytes()
		slices.Reverse(pt[:]) // as Assign encrypts the Channel Key
		msg := native.MsgOf(pt[:])
		w := msgOfCircuit{x, [2]frontend.Variable{msg[0], msg[1]}}
		if err := test.IsSolved(&msgOfCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
			t.Fatal(err)
		}
		w.Msg[1] = new(big.Int).Add(msg[1], big.NewInt(1))
		if test.IsSolved(&msgOfCircuit{}, &w, ecc.BN254.ScalarField()) == nil {
			t.Fatal("wrong high limb accepted")
		}
	}
}
