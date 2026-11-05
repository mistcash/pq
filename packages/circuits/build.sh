#!/bin/sh
# Regenerates every circuit artifact. Safe to re-run: each run overwrites all of them with a fresh, matching set.
# With "wasm", rebuilds only the WASM and keeps the setup, so the deployed verifier still matches.
set -e
cd "$(dirname "$0")"
[ "$1" = wasm ] || go run ./cmd/artifacts
GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o ../nextjs/public/circuits/pqmsg.wasm ./cmd/wasm
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../nextjs/public/circuits/
