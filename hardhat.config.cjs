require('@nomicfoundation/hardhat-toolbox-viem');
require('@nomicfoundation/hardhat-viem');
require('@nomicfoundation/hardhat-chai-matchers');

const { HardhatUserConfig, scope, task, types } = require('hardhat/config');

const { subtask, vars } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY } = require('hardhat/builtin-tasks/task-names');
const { join, resolve } = require('path');
const { writeFile } = require('fs/promises');
const { mkdirSync, writeFileSync } = require('fs');
const { gunzipSync } = require('zlib');
const { Barretenberg, RawBuffer, Crs } = require('@aztec/bb.js');
const { createFileManager, compile } = require('@noir-lang/noir_wasm');
const { CompiledCircuit } = require('@noir-lang/types');
const { exec } = require('shelljs');
const { Chain } = require('viem');

subtask(TASK_COMPILE_SOLIDITY).setAction(async (_, { config }, runSuper) => {
  const superRes = await runSuper();

  try {
    await writeFile(join(config.paths.root, 'artifacts', 'package.json'), '{ "type": "commonjs" }');
  } catch (error) {
    console.error('Error writing package.json: ', error);
  }

  return superRes;
});

async function compileCircuit(path = './circuit') {
  const basePath = resolve(join(path));
  const fm = createFileManager(basePath);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program;
}

async function generateArtifacts(path = './circuit', crsPath = './crs') {
  const circuit = await compileCircuit(path);
  const decompressed = gunzipSync(Buffer.from(circuit.bytecode, 'base64'));
  const api = await Barretenberg.new({ threads: 8 });
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(decompressed);
  const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));

  const crs = await Crs.new(subgroupSize + 1, crsPath);
  await api.commonInitSlabAllocator(subgroupSize);
  await api.srsInitSrs(
    new RawBuffer(crs.getG1Data()),
    crs.numPoints,
    new RawBuffer(crs.getG2Data()),
  );

  const acirComposer = await api.acirNewAcirComposer(subgroupSize);
  await api.acirInitProvingKey(acirComposer, decompressed);
  await api.acirInitVerificationKey(acirComposer);

  const contract = await api.acirGetSolidityVerifier(acirComposer);
  return { circuit, contract };
}

/*task('compile', 'Compile and generate circuits and contracts').setAction(
  async (_, __, runSuper) => {
    const { circuit, contract } = await generateArtifacts();
    // mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/circuit.json', JSON.stringify(circuit), { flag: 'w' });
    writeFileSync('artifacts/contract.sol', contract, { flag: 'w' });
    await runSuper();
  },
);*/

task('node', 'Runs a local blockchain').setAction(async (_, hre, runSuper) => {
  console.log("Starting network...")
  const networkConfig = (await import(`viem/chains`))[hre.network.name];
  const config = {
    name: hre.network.name,
    networkConfig: {
      ...networkConfig,
      id: hre.network.config.chainId || networkConfig.id,
    },
  };
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/deployment.json', JSON.stringify(config), { flag: 'w' });
  await runSuper();
})

task('deploy', 'Deploys the verifier contract')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    let verifier;
    if (attach) {
      verifier = await hre.viem.getContractAt('UltraVerifier', attach);
    } else {
      verifier = await hre.viem.deployContract('UltraVerifier');
    }

    const networkConfig = (await import(`viem/chains`))[hre.network.name];
    console.log(networkConfig);
    const config = {
      name: hre.network.name,
      address: verifier.address,
      networkConfig: {
        ...networkConfig,
        id: hre.network.config.chainId || networkConfig.id,
      },
    };

    console.log(
      `Attached to address ${verifier.address} at network ${hre.network.name} with chainId ${config.networkConfig.id}...`,
    );
    writeFileSync('artifacts/deployment_with_address.json', JSON.stringify(config), { flag: 'w' });
  });

subtask('generateHooks', 'Generates hooks for the verifier contract').setAction(async (_, hre) => {
  exec('wagmi generate');
});

subtask('prep', 'Compiles and deploys the verifier contract')
  .addParam('attach', 'Attach to an already deployed contract', '', types.string)
  .setAction(async ({ attach }, hre) => {
    console.log('Preparing...');
    console.log('Compiling circuits and generating contracts...');

    await hre.run('compile');
    await hre.run('deploy', { attach });

    console.log('Generating hooks...');
    await hre.run('generateHooks');
  });

task('dev', 'Deploys and starts in a development environment')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    await hre.run('prep', { attach });
    exec('vite dev');
  });

task('build', 'Builds the frontend project')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    await hre.run('prep', { attach });
    exec('vite build');
  });

task('serve', 'Serves the frontend project').setAction(async (_, hre) => {
  exec('vite preview');
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: vars.has('localhost')
        ? [vars.get('localhost')]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
    },
    scrollSepolia: {
      url: 'https://sepolia-rpc.scroll.io',
      accounts: vars.has('scrollSepolia') ? [vars.get('scrollSepolia')] : [],
    },
    holesky: {
      url: 'https://holesky.drpc.org',
      accounts: vars.has('holesky') ? [vars.get('holesky')] : [],
    },
  },
  paths: {
    root: './',
    sources: './artifacts',
    artifacts: './artifacts/hardhat',
  },
};
