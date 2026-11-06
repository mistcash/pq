package circuit

import (
	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/math/bits"
)

// DecompressMessage is Decompress_q(m, 1) of m as two 128-bit limbs; mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/poly.go#L134
func DecompressMessage(api frontend.API, f *F, msg [2]frontend.Variable) (p Poly) {
	half := f.NewElement((math.Q + 1) / 2)
	for j := range msg {
		for i, b := range bits.ToBinary(api, msg[j], bits.WithNbDigits(128)) {
			p[128*j+i] = *f.Select(b, half, f.Zero()) // free in R1CS for constant branches
		}
	}
	return
}

// MsgOf is native.MsgOf of x's 32 little-endian bytes: x's low and high 128 bits, with x < r so they're unique.
func MsgOf(api frontend.API, x frontend.Variable) [2]frontend.Variable {
	b := bits.ToBinary(api, x)
	return [2]frontend.Variable{bits.FromBinary(api, b[:128]), bits.FromBinary(api, b[128:])}
}
