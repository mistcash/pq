package circuit

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/std/math/emulated"
)

// Params emulates Z_q, q = 3329, in one 12-bit limb.
type Params struct{}

func (Params) NbLimbs() uint     { return 1 }
func (Params) BitsPerLimb() uint { return 12 }
func (Params) IsPrime() bool     { return true }
func (Params) Modulus() *big.Int { return big.NewInt(int64(math.Q)) }

// F is the emulated Z_q arithmetic.
type F = emulated.Field[Params]

// El is an element of Z_q.
type El = emulated.Element[Params]
