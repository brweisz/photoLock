import pako from 'pako';
import { Barretenberg, Crs, RawBuffer } from '@aztec/bb.js';

import { CompiledCircuit } from '@noir-lang/types';

export async function generateVerifierContract(circuit: CompiledCircuit) {

  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const decompressed = pako.ungzip(base64ToUint8Array(circuit.bytecode));
  const api = await Barretenberg.new({ threads: 8 });
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(decompressed);
  const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));

  const crs = await Crs.new(subgroupSize + 1, './crs');
  await api.commonInitSlabAllocator(subgroupSize);
  await api.srsInitSrs(
    new RawBuffer(crs.getG1Data()),
    crs.numPoints,
    new RawBuffer(crs.getG2Data()),
  );

  const acirComposer = await api.acirNewAcirComposer(subgroupSize);
  await api.acirInitProvingKey(acirComposer, decompressed);
  await api.acirInitVerificationKey(acirComposer);

  return await api.acirGetSolidityVerifier(acirComposer);
}