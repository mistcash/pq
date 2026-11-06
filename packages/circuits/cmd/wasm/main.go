//go:build js && wasm

// Command wasm is the browser crypto module, built with GOOS=js GOARCH=wasm.
// It sets globalThis.pqmsg. Field elements cross over as 0x-prefixed hex, and
// each function returns an Error value instead of throwing.
package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"
	"syscall/js"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	groth16bn254 "github.com/consensys/gnark/backend/groth16/bn254"
	"github.com/consensys/gnark/constraint"
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
		// userKey(senderKey) returns the packed Kyber512 public key to register.
		"userKey": fn(func(a []js.Value) (any, error) {
			senderKey, err := element(a[0])
			return "0x" + hex.EncodeToString(circuits.UserKey(senderKey)), err
		}),
		// decryptChannelKey(senderKey, encryptedChannelKey) returns a Channel Key, junk if the Channel isn't to you.
		"decryptChannelKey": fn(func(a []js.Value) (any, error) {
			senderKey, err := element(a[0])
			var ct native.Ciphertext
			for i := range ct {
				_, e := ct[i].SetString(a[1].Index(i).String())
				err = errors.Join(err, e)
			}
			return toHex(circuits.DecryptChannelKey(senderKey, ct)), err
		}),
		// encryptSender(channelKey, senderIndex)
		"encryptSender": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			return toHex(circuits.EncryptSender(channelKey, uint64(a[1].Int()))), err
		}),
		// decryptSender(channelKey, encryptedSender) returns the sender's User Index as hex.
		"decryptSender": fn(func(a []js.Value) (any, error) {
			channelKey, err := element(a[0])
			encryptedSender, err2 := element(a[1])
			return toHex(circuits.DecryptSender(channelKey, encryptedSender)), errors.Join(err, err2)
		}),
		// loadProver(ccs, pk) reads the constraint system and proving key once, for prove.
		"loadProver": async(func(a []js.Value) (any, error) {
			cs, key := groth16.NewCS(ecc.BN254), groth16.NewProvingKey(ecc.BN254)
			if _, err := cs.ReadFrom(bytes.NewReader(bytesOf(a[0]))); err != nil {
				return nil, err
			}
			// The key ships with this wasm, so skip the 18 s of subgroup checks.
			if _, err := key.UnsafeReadFrom(bytes.NewReader(bytesOf(a[1]))); err != nil {
				return nil, err
			}
			ccs, pk = cs, key
			return nil, nil
		}),
		// prove(userKey, channelKey) resolves to { proof, channelKeyHash, encryptedChannelKey }, ready for the contract.
		"prove": async(func(a []js.Value) (any, error) {
			if pk == nil {
				return nil, errors.New("call loadProver first")
			}
			userKey, err := hex.DecodeString(strings.TrimPrefix(a[0].String(), "0x"))
			if err != nil {
				return nil, err
			}
			channelKey, err := element(a[1])
			if err != nil {
				return nil, err
			}
			seed := make([]byte, 32)
			rand.Read(seed)
			proof, ct, err := circuits.ProveChannelKey(ccs, pk, userKey, channelKey, seed)
			if err != nil {
				return nil, err
			}
			encryptedChannelKey := make([]any, len(ct))
			for i := range ct {
				encryptedChannelKey[i] = toHex(ct[i])
			}
			return map[string]any{
				"proof":               "0x" + hex.EncodeToString(proof.(*groth16bn254.Proof).MarshalSolidity()),
				"channelKeyHash":      toHex(circuits.ChannelKeyHash(channelKey)),
				"encryptedChannelKey": encryptedChannelKey,
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
	})
	select {}
}

// The prover's constraint system and proving key, set by loadProver.
var (
	ccs constraint.ConstraintSystem
	pk  groth16.ProvingKey
)

// async is fn returning a Promise, settled from a goroutine so Go can wait on JavaScript meanwhile.
func async(f func(args []js.Value) (any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		return js.Global().Get("Promise").New(js.FuncOf(func(_ js.Value, settle []js.Value) any {
			go func() {
				v, err := f(args)
				if err != nil {
					settle[1].Invoke(js.Global().Get("Error").New(err.Error()))
					return
				}
				settle[0].Invoke(v)
			}()
			return nil
		}))
	})
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
