import express from 'express';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import hardhat from 'hardhat';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

async function compileContract(contractSourceCode){
  console.log("Writing file")
  // Save contract source code
  const filePath = path.join(__dirname, '/artifacts/SolidityVerifier.sol');
  writeFileSync(filePath, contractSourceCode, (err) => {
    if (err) {
      console.error('Error writing to file:', err)
    } else {
      console.log('File written successfully!');
    }
  })

  // Compile contract
  console.log("Compiling contract")
  await hardhat.run('compile', {
    sources: [filePath]
  });
  console.log("Contract compiled")
}

async function deployCompiledContract() {
  await hardhat.run("deploy")
}

app.post("/compile-circuit-and-generate-proof", async (req, res) => {
  let noirSourceCode = req.get("noirSourceCode");
  let inputs = req.get("inputs");
  let response = { object: undefined, errors: [] };

  try {
    // Write noir source code to file
    console.log("Writing file")
    const filePath = path.join(__dirname, '/artifacts/main.nr');

    writeFileSync(filePath, noirSourceCode, (err) => {
      if (err) {console.error('Error writing to file:', err)} else console.log('File written successfully!')})

    // The command should write the compiled circuit to a file (to use it later) and return the file and the proof
    // The compiled circuit is binary + abi
    let { proof, compiledCircuit } = await hardhat.run("generate-proof", {
      noirSourceCode,
      inputs
    });
    response.object = { proof };
  } catch (e) {
    console.log(e);
    response.errors.push(e.message);
  }

});

app.post("/compile-and-deploy-contract", async (req, res) => {
  let response = { object: undefined, errors: [] }
  try {
    let { contractSourceCode } = req.body;
    await compileContract(contractSourceCode)
    await deployCompiledContract()
    let deployment = await import("./artifacts/deployment_with_address.json", { assert: { type: 'json' } });
    exec("wagmi generate")
    response.object = { contractAddress: deployment.default.address }
  } catch (e) {
    console.log(e)
    response.errors.push(e.message)
  }
  res.send(response);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
