package circuits_test

import (
	"strings"
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

func TestChannelKeyHash(t *testing.T) {
	var channelKey fr.Element
	channelKey.SetUint64(42)
	assertHash(t, circuits.ChannelKeyHash(channelKey), 42)
}

func TestChannelKey(t *testing.T) {
	var senderKey fr.Element
	senderKey.SetUint64(42)
	assertHash(t, circuits.ChannelKey(senderKey, 7), 42, 7)
}

func TestSenderKeyFromFixedSignature(t *testing.T) {
	signature := make([]byte, 65)
	for i := range signature {
		signature[i] = byte(i + 1)
	}
	senderKey, err := circuits.SenderKey(signature)
	if err != nil {
		t.Fatal(err)
	}
	// The signature, zero-padded and split into three 31-byte big-endian chunks.
	assertHash(t, senderKey,
		"0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
		"0x202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e",
		"0x3f4041"+strings.Repeat("00", 28))
}

func TestSenderKeyRejectsSignatureNot65Bytes(t *testing.T) {
	if _, err := circuits.SenderKey(make([]byte, 64)); err == nil {
		t.Fatal("accepted a 64-byte signature")
	}
}

func TestMessageIDIsDeterministic(t *testing.T) {
	var channelKey, otherChannelKey fr.Element
	channelKey.SetUint64(42)
	otherChannelKey.SetUint64(43)
	id := circuits.MessageID(channelKey, 7)

	if id != circuits.MessageID(channelKey, 7) {
		t.Fatal("the same Channel Key and Message Index gave different Message IDs")
	}
	if id == circuits.MessageID(channelKey, 8) || id == circuits.MessageID(otherChannelKey, 7) {
		t.Fatal("a different Channel Key or Message Index gave the same Message ID")
	}
}

func TestEncryptThenDecrypt(t *testing.T) {
	var channelKey fr.Element
	channelKey.SetUint64(42)
	for _, message := range []string{"gm 🌞", strings.Repeat("62 bytes, spanning both Ciphertext Elements! ", 2)[:62]} {
		ciphertext, err := circuits.Encrypt(channelKey, 7, []byte(message))
		if err != nil {
			t.Fatal(err)
		}
		if got := string(circuits.Decrypt(channelKey, 7, ciphertext)); got != message {
			t.Fatalf("decrypted %q, want %q", got, message)
		}
		if string(circuits.Decrypt(channelKey, 8, ciphertext)) == message {
			t.Fatal("decrypted with another Message Index")
		}
	}
}

func TestEncryptRejectsMessageOver62Bytes(t *testing.T) {
	if _, err := circuits.Encrypt(fr.Element{}, 0, make([]byte, 63)); err == nil {
		t.Fatal("accepted a 63-byte message")
	}
}

func TestEncryptSender(t *testing.T) {
	var channelKey fr.Element
	channelKey.SetUint64(42)
	e := circuits.EncryptSender(channelKey, 7)
	if e == fr.NewElement(7) {
		t.Fatal("sender's User Index in the clear")
	}
	if got := circuits.DecryptSender(channelKey, e); got != fr.NewElement(7) {
		t.Fatalf("decrypted User Index %s, want 7", got.String())
	}
}
