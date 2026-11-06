package native_test

import (
	"bytes"
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestRoundTrip(t *testing.T) {
	for range 50 {
		ks, seed, pt := make([]byte, math.SeedSize), make([]byte, math.SeedSize), make([]byte, math.PlaintextSize)
		rand.Read(ks)
		rand.Read(seed)
		rand.Read(pt)
		pk, sk := math.NewKeyPair(ks)
		r, e1, e2 := native.Noise(seed)
		u, v := native.EncryptUV(pk, pt, r, e1, e2)
		if got := native.DecryptUV(sk, u, v); !bytes.Equal(got, pt) {
			t.Fatalf("got %x, want %x", got, pt)
		}
	}
}
