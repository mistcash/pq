# Proving on the GPU

Opening a Channel takes one Groth16 proof, made in the browser. On page load, the app starts a Web Worker (`public/circuits/prover.js`) that loads `pqmsg.wasm` and reads the proving key (22 MB) and constraint system (5 MB) once, so a proof only waits for the math. Kyber, Poseidon2 and the witness run in Go on the CPU, and the prover's heavy lifting moves to the GPU when it can:

1. `loadProver` reads the keys for the CPU, so a proof never waits for the GPU to set up.
2. Meanwhile, the worker imports `gnark-webgpu.js`: gnark's WebGPU runtime and WGSL shaders, which `build.sh` bundles from the gnark version pinned in `go.mod`. Its `install()` opens a GPU device, compiles the shaders and sets `globalThis.gnarkGroth16WebGPU`. That can take longer than a CPU proof.
3. Between proofs, `useGPU` finds that bridge and uploads the proving key to the GPU (`webgpu.Prepare`).
4. `groth16.Prove` then runs the G1 and G2 multi-scalar multiplications and the quotient's NTTs on the GPU.

Each step falls back to the CPU, so every browser can open a Channel:

- No WebGPU, or GPU setup still running: the CPU proves, in about 8 s.
- `webgpu.Prepare` fails: the CPU proves.
- A GPU proof fails: the worker frees the GPU and proves on the CPU from then on.

The console says when it moves to the GPU, `pqmsg prover on the GPU`, or why it stays on the CPU: `pqmsg prover on the CPU: no WebGPU, <reason>`, or plain `on the CPU` when `webgpu.Prepare` failed. On the GPU, the witness, including the secret Channel Key and noise, sits in GPU memory.

## Demo with DevTools profiling

1. Run the app locally (see [Run locally](README.md#run-locally)) and open http://localhost:3000 in a browser with WebGPU, such as desktop Chrome or Edge.
2. Open DevTools. Once the GPU is set up, the Console says `pqmsg prover on the GPU`, or `on the CPU` with the reason.
3. Register two Users, one per browser profile. The local chain's Burner Wallet works; fund it with the faucet button in the header.
4. In the Performance panel, start recording, pick the other User and tap **Say hi 👋**. Stop once it says "You're connected!".
5. The prover's worker thread shows two measures: `pqmsg load`, from the worker's start to a loaded prover, and `pqmsg prove`, the proof itself. On the GPU path, the GPU track is busy during `pqmsg prove`.
6. For the CPU path, use a browser without WebGPU, or turn it off (in Firefox, set `dom.webgpu.enabled` to false in `about:config`), reload and record again.
7. The Network panel shows what each visitor downloads once: `pqmsg.wasm` (15 MB), `openChannel.pk` (22 MB) and `openChannel.ccs` (5 MB).

The other User finds the Channel by tapping **Find my chats**.
