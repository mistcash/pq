package native

import (
	"math/big"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/mistcash/pqmsg/packages/circuits/circuit"
)

const (
	CoeffsPerElement   = circuit.CoeffsPerElement
	CiphertextElements = circuit.CiphertextElements
)

// Ciphertext is u‖v packed: coefficient n of u‖v is bits 12·(n%21) up of element n/21.
type Ciphertext = [CiphertextElements]fr.Element

// PackCiphertext packs normalized u and v.
func PackCiphertext(u math.Vec, v math.Poly) (c Ciphertext) {
	var b [CiphertextElements]big.Int
	for n, x := range coeffs(&u, &v) {
		b[n/CoeffsPerElement].Or(&b[n/CoeffsPerElement], new(big.Int).Lsh(big.NewInt(int64(*x)), 12*uint(n%CoeffsPerElement)))
	}
	for i := range c {
		c[i].SetBigInt(&b[i])
	}
	return
}

// UnpackCiphertext inverts PackCiphertext.
func UnpackCiphertext(c Ciphertext) (u math.Vec, v math.Poly) {
	for n, x := range coeffs(&u, &v) {
		b := c[n/CoeffsPerElement].BigInt(new(big.Int))
		*x = int16(b.Rsh(b, 12*uint(n%CoeffsPerElement)).Uint64() & 0xfff)
	}
	return
}

// coeffs points at the coefficients of u‖v in order.
func coeffs(u *math.Vec, v *math.Poly) (x []*int16) {
	for _, p := range []*math.Poly{&u[0], &u[1], v} {
		for i := range p {
			x = append(x, &p[i])
		}
	}
	return
}
