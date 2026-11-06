package circuit

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/constraint/solver"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/rangecheck"
)

// CoeffsPerElement is how many 12-bit coefficients one BN254 field element holds.
const CoeffsPerElement = 21

// CiphertextElements is how many field elements hold u‖v.
const CiphertextElements = ((math.K+1)*math.N + CoeffsPerElement - 1) / CoeffsPerElement

func init() { solver.RegisterHint(quo) }

// Pack is native.PackCiphertext in-circuit: coefficient n of u‖v, in [0, q), is bits 12·(n%21) up of element n/21.
func Pack(api frontend.API, f *F, u *Vec, v *Poly) (c [CiphertextElements]frontend.Variable) {
	rc := rangecheck.New(api)
	for i := range c {
		c[i] = 0
	}
	n := 0
	for _, p := range []*Poly{&u[0], &u[1], v} {
		for i := range p {
			x := canonical(api, rc, f.Reduce(&p[i]).Limbs[0])
			c[n/CoeffsPerElement] = api.MulAcc(c[n/CoeffsPerElement], x, new(big.Int).Lsh(big.NewInt(1), 12*uint(n%CoeffsPerElement)))
			n++
		}
	}
	return
}

// canonical returns x mod q for a reduced limb x < 2^12 < 2q: x - k·q with k = x / q, a bit.
// Cheaper than ReduceStrict, which costs more than all of Encrypt over u‖v.
func canonical(api frontend.API, rc frontend.Rangechecker, x frontend.Variable) frontend.Variable {
	k, err := api.Compiler().NewHint(quo, 1, x)
	if err != nil {
		panic(err)
	}
	api.AssertIsBoolean(k[0])
	y := api.Sub(x, api.Mul(k[0], int(math.Q)))
	rc.Check(y, 12)
	rc.Check(api.Add(y, 1<<12-int(math.Q)), 12) // y < q
	return y
}

// quo is the hint x / q.
func quo(_ *big.Int, in, out []*big.Int) error {
	out[0].Div(in[0], big.NewInt(int64(math.Q)))
	return nil
}
