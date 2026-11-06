package native_test

import (
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestNoise(t *testing.T) {
	seed := make([]byte, math.SeedSize)
	rand.Read(seed)
	r, e1, e2 := native.Noise(seed)
	r2, e12, e22 := native.Noise(seed)
	if r != r2 || e1 != e12 || e2 != e22 {
		t.Fatal("same seed, different noise")
	}
	seed[0] ^= 1
	r2, e12, e22 = native.Noise(seed)
	if r == r2 || e1 == e12 || e2 == e22 {
		t.Fatal("different seed, same noise")
	}
}
