//go:build js && wasm

// Command wasm is the browser crypto module, built with GOOS=js GOARCH=wasm.
// It sets globalThis.pqmsg. Field elements cross over as 0x-prefixed hex, and
// each function returns an Error value instead of throwing.
package main

import (
	"bytes"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"syscall/js"

	"github.com/cloudflare/circl/pke/kyber/kyber512/math"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	groth16bn254 "github.com/consensys/gnark/backend/groth16/bn254"
	"github.com/consensys/gnark/logger"
	"github.com/mistcash/pqmsg/packages/circuits"
	"github.com/mistcash/pqmsg/packages/circuits/native"
)

func main() {
	logger.Disable()
	js.Global().Set("pqmsg", map[string]any{
		// senderKey(signature)
		"senderKey": fn(func(a []js.Value) (any, error) {
			signature, err := hex.DecodeString(strings.TrimPrefix(a[0].String(), "0x"))
			if err != nil {
				return nil, err
			}
			senderKey, err := circuits.SenderKey(signature)
			return toHex(senderKey), err
		}),
		// channelKey(senderKey, userIndex)
		"channelKey": fn(func(a []js.Value) (any, error) {
			senderKey, err := element(a[0])
			return toHex(circuits.ChannelKey(senderKey, uint64(a[1].Int()))), err
		}),
		// channelKeyHash(channelKey)
		"channelKeyHash": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			return toHex(circuits.ChannelKeyHash(channelKey)), err
		}),
		// prove(ccs, pk, channelKey) returns { proof, channelKeyHash }, with the proof ready for the verifier contract.
		"prove": fn(func(a []js.Value) (any, error) {
			ccs := groth16.NewCS(ecc.BN254)
			if _, err := ccs.ReadFrom(bytes.NewReader(bytesOf(a[0]))); err != nil {
				return nil, err
			}
			pk := groth16.NewProvingKey(ecc.BN254)
			if _, err := pk.ReadFrom(bytes.NewReader(bytesOf(a[1]))); err != nil {
				return nil, err
			}
			channelKey, err := element(a[2])
			if err != nil {
				return nil, err
			}
			proof, channelKeyHash, err := circuits.ProveChannelKey(ccs, pk, channelKey)
			if err != nil {
				return nil, err
			}
			return map[string]any{
				"proof":          "0x" + hex.EncodeToString(proof.(*groth16bn254.Proof).MarshalSolidity()),
				"channelKeyHash": toHex(channelKeyHash),
			}, nil
		}),
		// messageId(channelKey, messageIndex)
		"messageId": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			return toHex(circuits.MessageID(channelKey, uint64(a[1].Int()))), err
		}),
		// encrypt(channelKey, messageIndex, message) returns the two Ciphertext Elements.
		"encrypt": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			c, tooLong := circuits.Encrypt(channelKey, uint64(a[1].Int()), []byte(a[2].String()))
			return []any{toHex(c[0]), toHex(c[1])}, errors.Join(err, tooLong)
		}),
		// decrypt(channelKey, messageIndex, ciphertext1, ciphertext2) returns the message.
		"decrypt": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			c1, err1 := element(a[2])
			c2, err2 := element(a[3])
			return string(circuits.Decrypt(channelKey, uint64(a[1].Int()), [2]fr.Element{c1, c2})), errors.Join(err, err1, err2)
		}),
		// kyberKeyPair(seed) returns { pk, sk }, packed.
		"kyberKeyPair": fn(func(a []js.Value) (any, error) {
			seed, err := hexBytes(a[0], math.SeedSize)
			if err != nil {
				return nil, err
			}
			pk, sk := math.NewKeyPair(seed)
			pkb, skb := make([]byte, math.PublicKeySize), make([]byte, math.PrivateKeySize)
			pk.Pack(pkb)
			sk.Pack(skb)
			return map[string]any{
				"pk": "0x" + hex.EncodeToString(pkb),
				"sk": "0x" + hex.EncodeToString(skb),
			}, nil
		}),
		// kyberEncrypt(pk, pt, seed) returns { u, v } uncompressed: u is K arrays of N coefficients, v is N.
		"kyberEncrypt": fn(func(a []js.Value) (any, error) {
			pkb, err := hexBytes(a[0], math.PublicKeySize)
			pt, err1 := hexBytes(a[1], math.PlaintextSize)
			seed, err2 := hexBytes(a[2], math.SeedSize)
			if err := errors.Join(err, err1, err2); err != nil {
				return nil, err
			}
			var pk math.PK
			pk.Unpack(pkb)
			r, e1, e2 := native.Noise(seed)
			u, v := native.EncryptUV(&pk, pt, r, e1, e2)
			us := make([]any, math.K)
			for i := range u {
				us[i] = coeffs(u[i])
			}
			return map[string]any{"u": us, "v": coeffs(v)}, nil
		}),
	})
	select {}
}

func fn(f func(args []js.Value) (any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		v, err := f(args)
		if err != nil {
			return js.Global().Get("Error").New(err.Error())
		}
		return v
	})
}

func element(v js.Value) (fr.Element, error) {
	var e fr.Element
	_, err := e.SetString(v.String())
	return e, err
}

func toHex(e fr.Element) string {
	b := e.Bytes()
	return "0x" + hex.EncodeToString(b[:])
}

func bytesOf(v js.Value) []byte {
	b := make([]byte, v.Length())
	js.CopyBytesToGo(b, v)
	return b
}

func coeffs(p math.Poly) []any {
	c := make([]any, math.N)
	for i, x := range p {
		c[i] = x
	}
	return c
}

// hexBytes decodes 0x-hex of exactly n bytes: circl slices unchecked, and a panic kills the module.
func hexBytes(v js.Value, n int) ([]byte, error) {
	b, err := hex.DecodeString(strings.TrimPrefix(v.String(), "0x"))
	if err == nil && len(b) != n {
		err = fmt.Errorf("want %d bytes, got %d", n, len(b))
	}
	return b, err
}
