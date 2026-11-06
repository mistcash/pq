// build.sh bundles this with gnark's WebGPU runtime and shaders, from the gnark version in go.mod, into gnark-webgpu.js.
import "gnark-webgpu/src/curvegpu/shader_bundle.generated";
import { createBN254, createCurveGPUContext } from "gnark-webgpu/index";
import { installGroth16WebGPUBridge } from "gnark-webgpu/src/curvegpu/bridge";

/** Installs globalThis.gnarkGroth16WebGPU, which pqmsg.wasm's prover uses when present. Throws without WebGPU. */
export const install = async () => {
  const context = await createCurveGPUContext();
  const { fr, g1msm, g2msm, ntt } = await createBN254(context);
  installGroth16WebGPUBridge({ context, curve: "bn254", fr, g1msm, g2msm, quotient: ntt });
};
