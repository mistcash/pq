// Command artifacts compiles the open Channel circuit, runs a dev-only Groth16
// setup, and writes the Solidity verifier, a test proof, the proving key and
// the constraint system. Run it from packages/circuits.
package main

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"io"
	"os"

	"github.com/consensys/gnark-crypto/ecc/bn254/fr"
	"github.com/consensys/gnark/backend/groth16"
	groth16bn254 "github.com/consensys/gnark/backend/groth16/bn254"
	"github.com/mistcash/pqmsg/packages/circuits"
)

const public = "../nextjs/public/circuits/"

func main() {
	ccs, err := circuits.Compile()
	check(err)
	pk, vk, err := groth16.Setup(ccs)
	check(err)
	var senderKey, channelKey fr.Element
	channelKey.SetUint64(42)
	proof, ct, err := circuits.ProveChannelKey(ccs, pk, circuits.UserKey(senderKey), channelKey, make([]byte, 32))
	check(err)
	channelKeyHash := circuits.ChannelKeyHash(channelKey)
	encryptedChannelKey := make([]string, len(ct))
	for i := range ct {
		encryptedChannelKey[i] = ct[i].String()
	}

	check(os.MkdirAll(public, 0o755))
	write("../foundry/contracts/Verifier.sol", func(w io.Writer) error { return vk.ExportSolidity(w) })
	write("../foundry/test/openChannelProof.json", func(w io.Writer) error {
		return json.NewEncoder(w).Encode(map[string]any{
			"channelKeyHash":      channelKeyHash.String(),
			"encryptedChannelKey": encryptedChannelKey,
			"proof":               "0x" + hex.EncodeToString(proof.(*groth16bn254.Proof).MarshalSolidity()),
		})
	})
	write(public+"openChannel.pk", func(w io.Writer) error { _, err := pk.WriteRawTo(w); return err })
	write(public+"openChannel.ccs", func(w io.Writer) error { _, err := ccs.WriteTo(w); return err })
}

func write(path string, fn func(io.Writer) error) {
	var b bytes.Buffer
	check(fn(&b))
	check(os.WriteFile(path, b.Bytes(), 0o644))
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
