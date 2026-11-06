package circuits

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
)

// tag is a second hash input beyond every uint64, so H(x, tag) is never a Channel Key or Message Key.
var tag = func() (t fr.Element) {
	t.SetBigInt(new(big.Int).Lsh(big.NewInt(1), 64))
	return
}()

// UserKeys returns the Kyber512 key pair seeded by H(senderKey, tag), so the wallet alone recovers it.
func UserKeys(senderKey fr.Element) (*math.PK, *math.SK) {
	h := hash(senderKey, tag)
	seed := h.Bytes()
	return math.NewKeyPair(seed[:])
}

// UserKey returns the packed Kyber512 public key of UserKeys, as registered.
func UserKey(senderKey fr.Element) []byte {
	pk, _ := UserKeys(senderKey)
	b := make([]byte, math.PublicKeySize)
	pk.Pack(b)
	return b
}
