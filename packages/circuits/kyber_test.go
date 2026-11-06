package circuits_test

import (
	"bytes"
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
