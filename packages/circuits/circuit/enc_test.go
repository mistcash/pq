package circuit_test

import (
	"bytes"
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestEncrypt(t *testing.T) {
	ks, seed, pt := make([]byte, math.SeedSize), make([]byte, math.SeedSize), make([]byte, math.PlaintextSize)
	rand.Read(ks)
	rand.Read(seed)
	rand.Read(pt)
	pk, sk := math.NewKeyPair(ks)
	r, e1, e2 := native.Noise(seed)
	u, v := native.EncryptUV(pk, pt, r, e1, e2)
	msg := native.MsgOf(pt)
	w := circuit.EncCircuit{
		native.MatOf(pk.AT()), native.VecOf(pk.Th(), true), [2]frontend.Variable{msg[0], msg[1]},
		native.VecOf(r, false), native.VecOf(e1, false), native.PolyOf(e2, false),
		native.VecOf(u, false), native.PolyOf(v, false),
	}
	if err := test.IsSolved(&circuit.EncCircuit{}, &w, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
	wit, err := frontend.NewWitness(&w, ecc.BN254.ScalarField())
	if err != nil {
		t.Fatal(err)
	}
	vec := wit.Vector().(fr.Vector)
	var uv [math.K + 1]math.Poly // U, V are the last fields, one limb per El
	for i, x := range vec[len(vec)-len(uv)*math.N:] {
		uv[i/math.N][i%math.N] = int16(x.Uint64())
	}
	if got := native.DecryptUV(sk, math.Vec(uv[:math.K]), uv[math.K]); !bytes.Equal(got, pt) {
		t.Fatalf("got %x, want %x", got, pt)
	}
	v[0] = (v[0] + 1) % math.Q
	w.V = native.PolyOf(v, false)
	if test.IsSolved(&circuit.EncCircuit{}, &w, ecc.BN254.ScalarField()) == nil {
		t.Fatal("tampered v accepted")
	}
}

func TestEncryptConstraints(t *testing.T) {
	cs, err := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuit.EncCircuit{})
	if err != nil {
		t.Fatal(err)
	}
	t.Log(cs.GetNbConstraints())
}
