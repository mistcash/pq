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

type noiseCircuit struct {
	P   circuit.Poly
	Eta int `gnark:"-"`
}

func (c *noiseCircuit) Define(api frontend.API) error {
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	circuit.AssertNoise(api, f, &c.P, c.Eta)
	return nil
}

func TestAssertNoise(t *testing.T) {
	seed := make([]byte, math.SeedSize)
	rand.Read(seed)
	r, e1, e2 := native.Noise(seed)
	for _, n := range []struct {
		p   math.Poly
		eta int
	}{{r[0], math.Eta1}, {r[1], math.Eta1}, {e1[0], math.Eta2}, {e1[1], math.Eta2}, {e2, math.Eta2}} {
		if err := test.IsSolved(&noiseCircuit{Eta: n.eta}, &noiseCircuit{P: native.PolyOf(n.p, false)}, ecc.BN254.ScalarField()); err != nil {
			t.Fatal(err)
		}
		for _, bad := range []int16{int16(n.eta) + 1, -int16(n.eta) - 1} {
			p := n.p
			p[0] = bad
			if test.IsSolved(&noiseCircuit{Eta: n.eta}, &noiseCircuit{P: native.PolyOf(p, false)}, ecc.BN254.ScalarField()) == nil {
				t.Fatalf("coefficient %d accepted for eta %d", bad, n.eta)
			}
		}
	}
}
