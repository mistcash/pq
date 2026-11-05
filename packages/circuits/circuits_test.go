package circuits_test

import (
	"testing"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
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
