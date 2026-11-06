#!/bin/sh
# Regenerates every circuit artifact. Safe to re-run: each run overwrites all of them with a fresh, matching set.
# With "wasm", rebuilds only the WASM and WebGPU runtime and keeps the setup, so the deployed verifier still matches.
set -e
cd "$(dirname "$0")"
[ "$1" = wasm ] || go run ./cmd/artifacts
GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o ../nextjs/public/circuits/pqmsg.wasm ./cmd/wasm
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../nextjs/public/circuits/
# gnark's WebGPU runtime and shaders, pinned by go.mod, bundled with cmd/wasm/webgpu.ts.
web=$(mktemp -d) && trap 'rm -rf "$web"' EXIT
gnark=$(go list -m -f '{{.Dir}}' github.com/consensys/gnark)/backend/accelerated/webgpu
cp -R "$gnark/web" "$gnark/shaders" "$web" && chmod -R u+w "$web"
node "$web/web/scripts/bundle-shaders.mjs"
npx --yes esbuild@0.28.2 cmd/wasm/webgpu.ts --bundle --format=esm --minify --alias:gnark-webgpu="$web/web" --outfile=../nextjs/public/circuits/gnark-webgpu.js
