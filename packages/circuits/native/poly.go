package native

import (
	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark/std/math/emulated"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

// PolyOf is the witness of p; set ntt when p is an NTT-domain value from circl.
func PolyOf(p math.Poly, ntt bool) (w circuit.Poly) {
	p.Normalize()
	if ntt {
		p.Detangle() // circl keeps NTT-domain polys tangled on AVX2
	}
	for i, c := range p {
		w[i] = emulated.ValueOf[circuit.Params](c)
	}
	return
}
