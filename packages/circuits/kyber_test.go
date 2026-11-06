package circuits_test

import (
	"bytes"
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/mistcash/pqmsg/packages/circuits"
)

func TestUserKeyIsDeterministic(t *testing.T) {
	var senderKey, other fr.Element
	senderKey.SetUint64(42)
	other.SetUint64(43)
	key := circuits.UserKey(senderKey)
	if len(key) != math.PublicKeySize {
		t.Fatalf("User Key is %d bytes, want %d", len(key), math.PublicKeySize)
	}
	if !bytes.Equal(key, circuits.UserKey(senderKey)) || bytes.Equal(key, circuits.UserKey(other)) {
		t.Fatal("User Key isn't a function of the Sender Key")
	}
}

func TestDecryptChannelKey(t *testing.T) {
	var senderKey, other, channelKey fr.Element
	senderKey.SetUint64(42)
	other.SetUint64(43)
	channelKey.SetString("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000") // r - 1, all 254 bits
	for range 20 {
		seed := make([]byte, 32)
		rand.Read(seed)
		_, ct, err := circuits.Assign(circuits.UserKey(senderKey), channelKey, seed)
		if err != nil {
			t.Fatal(err)
		}
		if got := circuits.DecryptChannelKey(senderKey, ct); got != channelKey {
			t.Fatalf("decrypted %s, want %s", got.String(), channelKey.String())
		}
		if circuits.DecryptChannelKey(other, ct) == channelKey {
			t.Fatal("decrypted with another User Key")
		}
	}
}
