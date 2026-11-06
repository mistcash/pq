package circuit

import (
	"math/bits"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
)

// Zetas[i] = 17^brv7(i) mod q (FIPS 203 Appendix A); plain form of https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/internal/common/ntt.go#L16
var Zetas = func() (z [128]int64) {
	for i := range z {
		z[i] = 1
		for range bits.Reverse8(uint8(i)) >> 1 {
			z[i] = z[i] * 17 % int64(math.Q)
		}
	}
	return
}()
