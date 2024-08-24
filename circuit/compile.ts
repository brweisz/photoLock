import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';

function stringToStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const uint8array = encoder.encode(text);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(uint8array);
      controller.close();
    }
  });
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  result += decoder.decode(); // decode any remaining bytes
  return result;
}

export async function compileCircuit(noirProgram: string) {
  const fm = createFileManager('/');
  const nargoToml = (await fetch(new URL(`./Nargo.toml`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;

  await fm.writeFile('./src/main.nr', stringToStream(noirProgram));
  await fm.writeFile('./Nargo.toml', nargoToml);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}
