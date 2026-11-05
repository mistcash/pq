// Package circuits holds pqmsg's gnark circuits.
package circuits

import (
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr/poseidon2"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	poseidon2gadget "github.com/consensys/gnark/std/hash/poseidon2"
)

// OpenChannel proves knowledge of a Channel Key whose hash is the Channel Key Hash.
type OpenChannel struct {
	ChannelKey     frontend.Variable
	ChannelKeyHash frontend.Variable `gnark:",public"`
}

func (c *OpenChannel) Define(api frontend.API) error {
	h, err := poseidon2gadget.New(api)
	if err != nil {
		return err
	}
	h.Write(c.ChannelKey)
	api.AssertIsEqual(h.Sum(), c.ChannelKeyHash)
	return nil
}

// ChannelKeyHash returns H(channelKey).
func ChannelKeyHash(channelKey fr.Element) fr.Element {
	h := poseidon2.NewMerkleDamgardHasher()
	b := channelKey.Bytes()
	h.Write(b[:])
	var hash fr.Element
	hash.SetBytes(h.Sum(nil))
	return hash
}

// ProveChannelKey proves knowledge of channelKey and returns the proof with its Channel Key Hash.
func ProveChannelKey(ccs constraint.ConstraintSystem, pk groth16.ProvingKey, channelKey fr.Element) (groth16.Proof, fr.Element, error) {
	hash := ChannelKeyHash(channelKey)
	w, err := frontend.NewWitness(&OpenChannel{ChannelKey: channelKey, ChannelKeyHash: hash}, ecc.BN254.ScalarField())
	if err != nil {
		return nil, hash, err
	}
	proof, err := groth16.Prove(ccs, pk, w)
	return proof, hash, err
}
