// Package circuits holds pqmsg's gnark circuits.
package circuits

import (
	"bytes"
	"errors"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr/poseidon2"
	"github.com/consensys/gnark/backend"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/backend/solidity"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	poseidon2gadget "github.com/consensys/gnark/std/hash/poseidon2"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
	"github.com/mistcash/pqmsg/packages/circuits/native"
	"golang.org/x/crypto/argon2"
)

// OpenChannel proves knowledge of a Channel Key whose hash is the Channel Key Hash, and that Ciphertext
// encrypts it to a User Key. The User Key stays private, so the recipient stays hidden. Assign builds the witness.
type OpenChannel struct {
	ChannelKey     frontend.Variable
	ChannelKeyHash frontend.Variable `gnark:",public"`
	// The Encrypted Channel Key; see native.PackCiphertext.
	Ciphertext [native.CiphertextElements]frontend.Variable `gnark:",public"`
	// The recipient's User Key.
	AT circuit.Mat
	Th circuit.Vec
	// The encryption noise; see native.Noise.
	R, E1 circuit.Vec
	E2    circuit.Poly
}

func (c *OpenChannel) Define(api frontend.API) error {
	h, err := poseidon2gadget.New(api)
	if err != nil {
		return err
	}
	h.Write(c.ChannelKey)
	api.AssertIsEqual(h.Sum(), c.ChannelKeyHash)
	f, err := emulated.NewField[circuit.Params](api)
	if err != nil {
		return err
	}
	for i := range c.R {
		circuit.AssertNoise(api, f, &c.R[i], math.Eta1)
		circuit.AssertNoise(api, f, &c.E1[i], math.Eta2)
	}
	circuit.AssertNoise(api, f, &c.E2, math.Eta2)
	u, v := circuit.Encrypt(api, f, &c.AT, &c.Th, circuit.MsgOf(api, c.ChannelKey), &c.R, &c.E1, &c.E2)
	for i, x := range circuit.Pack(api, f, &u, &v) {
		api.AssertIsEqual(x, c.Ciphertext[i])
	}
	return nil
}

// Compile compiles OpenChannel.
func Compile() (constraint.ConstraintSystem, error) {
	return frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &OpenChannel{})
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

// SenderKey returns H of a 65-byte wallet signature, zero-padded and split into three 31-byte big-endian chunks, and of
// the Password stretched by Argon2id with RFC 9106's second recommended parameters, salted with the signature. A
// quantum attacker can re-sign from the wallet's public key, but still needs the Password (ADR-0004).
func SenderKey(signature []byte, password string) (fr.Element, error) {
	if len(signature) != 65 {
		return fr.Element{}, errors.New("signature must be 65 bytes")
	}
	var padded [93]byte
	copy(padded[:], signature)
	var chunks [3]fr.Element
	for i := range chunks {
		chunks[i].SetBytes(padded[i*31 : (i+1)*31])
	}
	// 31 bytes always fit below the field modulus.
	var stretched fr.Element
	stretched.SetBytes(argon2.IDKey([]byte(password), signature, 3, 64*1024, 4, 31))
	return hash(append(chunks[:], stretched)...), nil
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
	if len(message) > 62 {
		return [2]fr.Element{}, errors.New("message must be at most 62 bytes")
	}
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

// ProveChannelKey encrypts channelKey to userKey with the noise of seed, and proves it.
func ProveChannelKey(ccs constraint.ConstraintSystem, pk groth16.ProvingKey, userKey []byte, channelKey fr.Element, seed []byte) (groth16.Proof, native.Ciphertext, error) {
	a, ct, err := Assign(userKey, channelKey, seed)
	if err != nil {
		return nil, ct, err
	}
	w, err := frontend.NewWitness(a, ecc.BN254.ScalarField())
	if err != nil {
		return nil, ct, err
	}
	// Hash the range checks' commitment with keccak256, as the exported Verifier.sol does.
	proof, err := groth16.Prove(ccs, pk, w, solidity.WithProverTargetSolidityVerifier(backend.GROTH16))
	return proof, ct, err
}

// EncryptSender returns the Encrypted Sender, senderIndex + H(channelKey, tag), which only the Channel's two ends can read.
func EncryptSender(channelKey fr.Element, senderIndex uint64) fr.Element {
	pad := hash(channelKey, tag)
	i := fr.NewElement(senderIndex)
	return *i.Add(&i, &pad)
}

// DecryptSender returns the sender's User Index in encryptedSender.
func DecryptSender(channelKey, encryptedSender fr.Element) fr.Element {
	pad := hash(channelKey, tag)
	return *encryptedSender.Sub(&encryptedSender, &pad)
}
