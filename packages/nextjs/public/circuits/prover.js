// The prover's Web Worker: loads pqmsg.wasm and its keys at once, then answers each { userKey, channelKey }
// on the port it came with, with { result } or { error }.
importScripts("wasm_exec.js");

const bytes = async path => new Uint8Array(await (await fetch(path)).arrayBuffer());

const ready = (async () => {
  // gnark's WebGPU bridge, when this browser has WebGPU; pqmsg.wasm then proves on the GPU. A GPU that needs
  // over 10 s to set up is unlikely to beat the CPU's ~8 s proof.
  const webgpu = Promise.race([
    import("./gnark-webgpu.js").then(m => m.install()),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), 10_000)),
  ]);
  const go = new Go();
  const { instance } = await WebAssembly.instantiateStreaming(fetch("pqmsg.wasm"), go.importObject);
  go.run(instance);
  const keys = await Promise.all([bytes("openChannel.ccs"), bytes("openChannel.pk")]);
  await webgpu.catch(e => console.info("pqmsg prover: no WebGPU,", e.message));
  console.info("pqmsg prover on the", (await pqmsg.loadProver(...keys)) ? "GPU" : "CPU");
})();

onmessage = async ({ data: { userKey, channelKey }, ports: [port] }) => {
  try {
    await ready;
    port.postMessage({ result: await pqmsg.prove(userKey, channelKey) });
  } catch (e) {
    port.postMessage({ error: e.message });
  }
};
