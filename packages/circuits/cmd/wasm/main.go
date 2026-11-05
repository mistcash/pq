//go:build js && wasm

// Command wasm is the browser crypto module, built with GOOS=js GOARCH=wasm.
// It sets globalThis.pqmsg. Field elements cross over as 0x-prefixed hex, and
// each function returns an Error value instead of throwing.
package main

import (
	"bytes"
	"encoding/hex"
	"strings"
	"syscall/js"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	groth16bn254 "github.com/consensys/gnark/backend/groth16/bn254"
	"github.com/consensys/gnark/logger"
	"github.com/mistcash/pqmsg/packages/circuits"
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
