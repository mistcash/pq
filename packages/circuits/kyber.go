package circuits

import (
	"errors"
	"math/big"
	"slices"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/mistcash/pqmsg/packages/circuits/native"
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

// Assign returns the OpenChannel assignment encrypting channelKey to userKey with the noise of seed, and the Encrypted
// Channel Key. The plaintext is channelKey as 32 little-endian bytes, so ChannelKey = m[0] + 2^128·m[1] for m = native.MsgOf(plaintext).
func Assign(userKey []byte, channelKey fr.Element, seed []byte) (*OpenChannel, native.Ciphertext, error) {
	var ct native.Ciphertext
	if len(userKey) != math.PublicKeySize {
		return nil, ct, errors.New("User Key must be 800 bytes")
	}
	var pk math.PK
	pk.Unpack(userKey)
	pt := channelKey.Bytes()
	slices.Reverse(pt[:])
	r, e1, e2 := native.Noise(seed)
	ct = native.PackCiphertext(native.EncryptUV(&pk, pt[:], r, e1, e2))
	a := &OpenChannel{
		ChannelKey: channelKey, ChannelKeyHash: ChannelKeyHash(channelKey),
		AT: native.MatOf(pk.AT()), Th: native.VecOf(pk.Th(), true),
		R: native.VecOf(r, false), E1: native.VecOf(e1, false), E2: native.PolyOf(e2, false),
	}
	for i := range ct {
		a.Ciphertext[i] = ct[i]
	}
	return a, ct, nil
}
