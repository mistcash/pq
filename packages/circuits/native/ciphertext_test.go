package native_test

import (
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestPackCiphertext(t *testing.T) {
	if native.CiphertextElements != 37 {
		t.Fatalf("%d Ciphertext elements, want 37", native.CiphertextElements)
	}
	ks, seed, pt := make([]byte, math.SeedSize), make([]byte, math.SeedSize), make([]byte, math.PlaintextSize)
	rand.Read(ks)
	rand.Read(seed)
	rand.Read(pt)
	pk, _ := math.NewKeyPair(ks)
	r, e1, e2 := native.Noise(seed)
	u, v := native.EncryptUV(pk, pt, r, e1, e2)
	if gu, gv := native.UnpackCiphertext(native.PackCiphertext(u, v)); gu != u || gv != v {
		t.Fatal("unpacked a different u, v")
	}
}
