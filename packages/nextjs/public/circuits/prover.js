// The prover's Web Worker: loads pqmsg.wasm and its keys at once, then answers each { userKey, channelKey }
// on the port it came with, with { result } or { error }.
importScripts("wasm_exec.js");

const bytes = async path => new Uint8Array(await (await fetch(path)).arrayBuffer());

const ready = (async () => {
  const go = new Go();
  const { instance } = await WebAssembly.instantiateStreaming(fetch("pqmsg.wasm"), go.importObject);
  go.run(instance);
  await pqmsg.loadProver(...(await Promise.all([bytes("openChannel.ccs"), bytes("openChannel.pk")])));
})();

onmessage = async ({ data: { userKey, channelKey }, ports: [port] }) => {
  try {
    await ready;
    port.postMessage({ result: await pqmsg.prove(userKey, channelKey) });
  } catch (e) {
    port.postMessage({ error: e.message });
  }
};
