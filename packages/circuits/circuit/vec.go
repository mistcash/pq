package circuit

// DotHat mirrors https://github.com/mistcash/circl/blob/v1.6.4-e.1/pke/kyber/kyber512/internal/vec.go#L28
func DotHat(f *F, a, b *Vec) Poly {
	p := MulHat(f, &a[0], &b[0])
	for i := 1; i < len(a); i++ {
		t := MulHat(f, &a[i], &b[i])
		p = Add(f, &p, &t)
	}
	return p
}
