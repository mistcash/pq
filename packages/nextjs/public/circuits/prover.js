// The prover's Web Worker: loads pqmsg.wasm and its keys at once, then answers each { userKey, channelKey }
// on the port it came with, with { result } or { error }.
importScripts("wasm_exec.js");

const bytes = async path => new Uint8Array(await (await fetch(path)).arrayBuffer());

// The prover's steps, one at a time. It loads on the CPU, so a proof never waits for the GPU to set up.
let queue = (async () => {
  const go = new Go();
  const { instance } = await WebAssembly.instantiateStreaming(fetch("pqmsg.wasm"), go.importObject);
  go.run(instance);
  await pqmsg.loadProver(...(await Promise.all([bytes("openChannel.ccs"), bytes("openChannel.pk")])));
  // DevTools' Performance panel shows these on the worker's track.
  performance.measure("pqmsg load");
})();
const next = step => (queue = queue.then(step));

// gnark's WebGPU bridge, when this browser has WebGPU; the prover moves to the GPU between proofs.
import("./gnark-webgpu.js")
  .then(m => m.install())
  .then(
    () => next(async () => console.info("pqmsg prover on the", (await pqmsg.useGPU()) ? "GPU" : "CPU")),
    e => console.info("pqmsg prover on the CPU: no WebGPU,", e.message),
  );

onmessage = ({ data: { userKey, channelKey }, ports: [port] }) =>
  next(async () => {
    const start = performance.now();
    const result = await pqmsg.prove(userKey, channelKey);
    performance.measure("pqmsg prove", { start });
    return result;
  }).then(
    result => port.postMessage({ result }),
    e => port.postMessage({ error: e.message }),
  );
