package native_test

import (
	"bytes"
	"crypto/rand"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func TestMsgOf(t *testing.T) {
	pt := make([]byte, math.PlaintextSize)
	rand.Read(pt)
	m := native.MsgOf(pt)
	got := make([]byte, math.PlaintextSize)
	for i := range 8 * math.PlaintextSize {
		got[i/8] |= byte(m[i/128].Bit(i%128)) << (i % 8)
	}
	if !bytes.Equal(got, pt) {
		t.Fatalf("got %x, want %x", got, pt)
	}
}
