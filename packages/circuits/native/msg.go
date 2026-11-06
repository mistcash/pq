package native

import (
	"math/big"
	"slices"
)

// MsgOf is pt as two 128-bit limbs in the bit order of https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/poly.go#L134: bit i of pt is bit i%128 of limb i/128.
func MsgOf(pt []byte) (m [2]*big.Int) {
	for j := range m {
		b := slices.Clone(pt[16*j : 16*(j+1)])
		slices.Reverse(b)
		m[j] = new(big.Int).SetBytes(b)
	}
	return
}
