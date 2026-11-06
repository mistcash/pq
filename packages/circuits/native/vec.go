package native

import (
	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

// VecOf is the witness of v; see PolyOf.
func VecOf(v math.Vec, ntt bool) (w circuit.Vec) {
	for i := range v {
		w[i] = PolyOf(v[i], ntt)
	}
	return
}

// MatOf is the witness of the NTT-domain m, e.g. pk.AT().
func MatOf(m math.Mat) (w circuit.Mat) {
	for i := range m {
		w[i] = VecOf(m[i], true)
	}
	return
}
