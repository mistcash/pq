package circuit

import "github.com/cloudflare/circl/pke/kyber/kyber512/math"

// CoeffsPerElement is how many 12-bit coefficients one BN254 field element holds.
const CoeffsPerElement = 21

// CiphertextElements is how many field elements hold u‖v.
const CiphertextElements = ((math.K+1)*math.N + CoeffsPerElement - 1) / CoeffsPerElement
