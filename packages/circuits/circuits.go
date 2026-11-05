// Package circuits holds pqmsg's gnark circuits.
package circuits

import (
	"bytes"
	"errors"

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

// hash returns H(elements...) with gnark's native Poseidon2 Merkle-Damgård hasher.
func hash(elements ...fr.Element) fr.Element {
	h := poseidon2.NewMerkleDamgardHasher()
	for _, e := range elements {
		b := e.Bytes()
		h.Write(b[:])
	}
	var sum fr.Element
	sum.SetBytes(h.Sum(nil))
	return sum
}

// SenderKey returns H of a 65-byte wallet signature, zero-padded and split into three 31-byte big-endian chunks.
func SenderKey(signature []byte) (fr.Element, error) {
	if len(signature) != 65 {
		return fr.Element{}, errors.New("signature must be 65 bytes")
	}
	var padded [93]byte
	copy(padded[:], signature)
	var chunks [3]fr.Element
	for i := range chunks {
		chunks[i].SetBytes(padded[i*31 : (i+1)*31])
	}
	return hash(chunks[:]...), nil
}

// ChannelKey returns H(senderKey, userIndex), the Channel Key from a sender to the User at userIndex.
func ChannelKey(senderKey fr.Element, userIndex uint64) fr.Element {
	var i fr.Element
	i.SetUint64(userIndex)
	return hash(senderKey, i)
}

// ChannelKeyHash returns H(channelKey).
func ChannelKeyHash(channelKey fr.Element) fr.Element {
	return hash(channelKey)
}

// messageKey returns H(channelKey, index), the Message Key.
func messageKey(channelKey fr.Element, index uint64) fr.Element {
	return hash(channelKey, fr.NewElement(index))
}

// MessageID returns H(Message Key, 0), the public ID the message at index is stored under.
func MessageID(channelKey fr.Element, index uint64) fr.Element {
	return hash(messageKey(channelKey, index), fr.Element{})
}

// pads returns H(Message Key, j) for j = 1, 2.
func pads(channelKey fr.Element, index uint64) [2]fr.Element {
	key := messageKey(channelKey, index)
	return [2]fr.Element{hash(key, fr.NewElement(1)), hash(key, fr.NewElement(2))}
}

// Encrypt returns the two Ciphertext Elements m_j + H(Message Key, j), where m_j is
// the j-th 31-byte big-endian chunk of the message, zero-padded to 62 bytes.
func Encrypt(channelKey fr.Element, index uint64, message []byte) ([2]fr.Element, error) {
	var padded [62]byte
	copy(padded[:], message)
	ciphertext := pads(channelKey, index)
	for j := range ciphertext {
		var m fr.Element
		m.SetBytes(padded[j*31 : (j+1)*31])
		ciphertext[j].Add(&ciphertext[j], &m)
	}
	return ciphertext, nil
}

// Decrypt returns the message in two Ciphertext Elements, without its zero padding.
func Decrypt(channelKey fr.Element, index uint64, ciphertext [2]fr.Element) []byte {
	pad := pads(channelKey, index)
	var message []byte
	for j := range ciphertext {
		var m fr.Element
		b := m.Sub(&ciphertext[j], &pad[j]).Bytes()
		message = append(message, b[1:]...)
	}
	return bytes.TrimRight(message, "\x00")
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
