package circuits_test

import (
	"slices"
	"strings"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/backend/solidity"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/hash/poseidon2"
	"github.com/consensys/gnark/test"
	"github.com/mistcash/pqmsg/packages/circuits"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestProveChannelKey(t *testing.T) {
	ccs, err := circuits.Compile()
	if err != nil {
		t.Fatal(err)
	}
	pk, vk, err := groth16.Setup(ccs)
	if err != nil {
		t.Fatal(err)
	}
	var senderKey, channelKey fr.Element
	channelKey.SetUint64(42)

	proof, ct, err := circuits.ProveChannelKey(ccs, pk, circuits.UserKey(senderKey), channelKey, make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}

	assignment := &circuits.OpenChannel{ChannelKeyHash: circuits.ChannelKeyHash(channelKey)}
	for i := range ct {
		assignment.Ciphertext[i] = ct[i]
	}
	public, err := frontend.NewWitness(assignment, ecc.BN254.ScalarField(), frontend.PublicOnly())
	if err != nil {
		t.Fatal(err)
	}
	if err := groth16.Verify(proof, vk, public, solidity.WithVerifierTargetSolidityVerifier(backend.GROTH16)); err != nil {
		t.Fatal(err)
	}
}

func TestOpenChannelRejectsWrongChannelKeyHash(t *testing.T) {
	var senderKey, channelKey fr.Element
	channelKey.SetUint64(42)
	a, _, err := circuits.Assign(circuits.UserKey(senderKey), channelKey, make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	if err := test.IsSolved(&circuits.OpenChannel{}, a, ecc.BN254.ScalarField()); err != nil {
		t.Fatal(err)
	}
	a.ChannelKeyHash = 42
	if test.IsSolved(&circuits.OpenChannel{}, a, ecc.BN254.ScalarField()) == nil {
		t.Fatal("solved with a wrong Channel Key Hash")
	}
}

func TestOpenChannelRejectsWrongEncryptedChannelKey(t *testing.T) {
	var senderKey, channelKey, other fr.Element
	channelKey.SetUint64(42)
	other.SetUint64(43)
	a, ct, err := circuits.Assign(circuits.UserKey(senderKey), channelKey, make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	_, otherCt, err := circuits.Assign(circuits.UserKey(senderKey), other, make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	ct[36].Add(&ct[36], new(fr.Element).SetOne())
	for _, wrong := range []native.Ciphertext{ct, otherCt} {
		for i := range wrong {
			a.Ciphertext[i] = wrong[i]
		}
		if test.IsSolved(&circuits.OpenChannel{}, a, ecc.BN254.ScalarField()) == nil {
			t.Fatal("solved with a wrong Encrypted Channel Key")
		}
	}
}

func TestOpenChannelRejectsNoiseOutOfRange(t *testing.T) {
	var senderKey, channelKey fr.Element
	channelKey.SetUint64(42)
	a, _, err := circuits.Assign(circuits.UserKey(senderKey), channelKey, make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	pk, _ := circuits.UserKeys(senderKey)
	pt := channelKey.Bytes()
	slices.Reverse(pt[:])
	r, e1, e2 := native.Noise(make([]byte, 32))
	e2[0] = (math.Q + 1) / 2 // flips plaintext bit 0
	ct := native.PackCiphertext(native.EncryptUV(pk, pt[:], r, e1, e2))
	if circuits.DecryptChannelKey(senderKey, ct) == channelKey {
		t.Fatal("decrypted the Channel Key despite the noise")
	}
	a.E2 = native.PolyOf(e2, false)
	for i := range ct {
		a.Ciphertext[i] = ct[i]
	}
	if test.IsSolved(&circuits.OpenChannel{}, a, ecc.BN254.ScalarField()) == nil {
		t.Fatal("solved with noise out of range")
	}
}

func TestAssignRejectsUserKeyNot800Bytes(t *testing.T) {
	if _, _, err := circuits.Assign(make([]byte, 799), fr.Element{}, make([]byte, 32)); err == nil {
		t.Fatal("accepted a 799-byte User Key")
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

func TestSenderKeyFromFixedSignatureAndPassword(t *testing.T) {
	signature := make([]byte, 65)
	for i := range signature {
		signature[i] = byte(i + 1)
	}
	senderKey, err := circuits.SenderKey(signature, "correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	// The signature, zero-padded and split into three 31-byte big-endian chunks, then the stretched password. Pinned,
	// since changing the Argon2id parameters would lock every User out.
	assertHash(t, senderKey,
		"0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
		"0x202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e",
		"0x3f4041"+strings.Repeat("00", 28),
		"0x086beeccd1cda97660da6836729df13f12804234f484d04df4ff405c3c8aca")
}

func TestSenderKeyRejectsSignatureNot65Bytes(t *testing.T) {
	if _, err := circuits.SenderKey(make([]byte, 64), "correct horse battery staple"); err == nil {
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
