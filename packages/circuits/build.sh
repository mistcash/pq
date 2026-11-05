#!/bin/sh
# Regenerates every circuit artifact. Safe to re-run: each run overwrites all of them with a fresh, matching set.
set -e
cd "$(dirname "$0")"
go run ./cmd/artifacts
GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o ../nextjs/public/circuits/pqmsg.wasm ./cmd/wasm
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../nextjs/public/circuits/
