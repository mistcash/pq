package native_test

import (
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
)

func TestCirclSmoke(t *testing.T) {
	pk, sk := math.NewKeyPair(make([]byte, math.SeedSize))
	if pk.AT() == (math.Mat{}) || pk.Th() == (math.Vec{}) || sk.Sh() == (math.Vec{}) {
		t.Fatal("zero key component")
	}
}
