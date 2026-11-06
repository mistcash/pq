package circuit_test

import (
	"math/rand/v2"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func assertEq(f *circuit.F, a, b *circuit.Poly) {
	for i := range a {
		f.AssertIsEqual(&a[i], &b[i])
	}
}

func randPoly() (p math.Poly) {
	for i := range p {
		p[i] = int16(rand.IntN(int(math.Q)))
	}
	return
}

type addCircuit struct{ A, B, C circuit.Poly }

func (c *addCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	p := circuit.Add(f, &c.A, &c.B)
	assertEq(f, &p, &c.C)
	return nil
}

func TestAdd(t *testing.T) {
	var w addCircuit
	for i := range math.N {
		a, b := rand.IntN(int(math.Q)), rand.IntN(int(math.Q))
		w.A[i] = emulated.ValueOf[circuit.Params](a)
		w.B[i] = emulated.ValueOf[circuit.Params](b)
		w.C[i] = emulated.ValueOf[circuit.Params]((a + b) % int(math.Q))
	}
	if err := test.IsSolved(&addCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}

type mulHatCircuit struct{ A, B, C circuit.Poly }

func (c *mulHatCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	p := circuit.MulHat(f, &c.A, &c.B)
	assertEq(f, &p, &c.C)
	return nil
}

func TestMulHat(t *testing.T) {
	a, b := randPoly(), randPoly()
	a.NTT()
	a.BarrettReduce()
	b.NTT()
	b.BarrettReduce()
	var c math.Poly
	c.MulHat(&a, &b)
	c.ToMont()
	w := mulHatCircuit{native.PolyOf(a, true), native.PolyOf(b, true), native.PolyOf(c, true)}
	if err := test.IsSolved(&mulHatCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}
