package circuits_test

import (
	"testing"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	"github.com/consensys/gnark/std/hash/poseidon2"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits"
)

func TestProveChannelKey(t *testing.T) {
	ccs, err := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuits.OpenChannel{})
	if err != nil {
		t.Fatal(err)
	}
	pk, vk, err := groth16.Setup(ccs)
	if err != nil {
		t.Fatal(err)
	}
	var channelKey fr.Element
	channelKey.SetUint64(42)

	proof, channelKeyHash, err := circuits.ProveChannelKey(ccs, pk, channelKey)
	if err != nil {
		t.Fatal(err)
	}

	public, err := frontend.NewWitness(&circuits.OpenChannel{ChannelKeyHash: channelKeyHash}, ecc.BN254.ScalarField(), frontend.PublicOnly())
	if err != nil {
		t.Fatal(err)
	}
	if err := groth16.Verify(proof, vk, public); err != nil {
		t.Fatal(err)
	}
}

func TestOpenChannelRejectsWrongChannelKeyHash(t *testing.T) {
	wrong := &circuits.OpenChannel{ChannelKey: 42, ChannelKeyHash: 42}
	if test.IsSolved(&circuits.OpenChannel{}, wrong, ecc.BN254.ScalarField()) == nil {
		t.Fatal("solved with a wrong Channel Key Hash")
	}
}

// hashCircuit checks Out = H(In...) with gnark's in-circuit Poseidon2, an independent check on the native hashes.
type hashCircuit struct {
	In  []frontend.Variable
	Out frontend.Variable
}

func (c *hashCircuit) Define(api frontend.API) error {
	h, err := poseidon2.New(api)
	if err != nil {
		return err
	}
	h.Write(c.In...)
	api.AssertIsEqual(h.Sum(), c.Out)
	return nil
}

func assertHash(t *testing.T, got fr.Element, in ...frontend.Variable) {
	t.Helper()
	circuit := &hashCircuit{In: make([]frontend.Variable, len(in))}
	if err := test.IsSolved(circuit, &hashCircuit{In: in, Out: got}, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
}

func TestChannelKey(t *testing.T) {
	var senderKey fr.Element
	senderKey.SetUint64(42)
	assertHash(t, circuits.ChannelKey(senderKey, 7), 42, 7)
}
