package circuit_test

import (
	"slices"
	"testing"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

func TestZetas(t *testing.T) {
	if !slices.Equal(circuit.Zetas[:8], []int64{1, 1729, 2580, 3289, 2642, 630, 1897, 848}) {
		t.Fatal(circuit.Zetas[:8])
	}
	for i, z := range math.Zetas {
		if circuit.Zetas[i] != int64(z)*169%int64(math.Q) {
			t.Fatal(i)
		}
	}
}
