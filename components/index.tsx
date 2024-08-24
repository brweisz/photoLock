// @ts-nocheck

import React, { useState } from 'react';

import { useOnChainVerification } from '../hooks/useOnChainVerification.js';
import { compileCircuit } from '../circuit/compile.js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { toast } from 'react-toastify';
import { bytesToHex } from 'viem';
import { generateVerifierContract } from './contract.js';
import { createUseReadContract } from 'wagmi/codegen';
import { ultraVerifierAbi } from '../hooks/verifierContractABI.ts';
import Switch from 'react-switch'

export default function Component() {

  let { isConnected, connectDisconnectButton, address } = useOnChainVerification();
  let [proveOnServer, setProveOnServer] = useState(false);
  const [backend, setBackend] = useState();
  let [provingArgs, setProvingArgs] = useState();
  const [currentCompiledCircuit, setCurrentCompiledCircuit] = useState();

  let [contractAddress, setContractAddress] = useState();
  const [args, setArgs] = useState();
  let useReadUltraVerifierVerify = createUseReadContract({
    abi: ultraVerifierAbi,
    address: contractAddress,
    functionName: 'verify',
  })
  const { data, error } = useReadUltraVerifierVerify({args, query: {enabled: !!args}});

  const verifyOnChain = async function() {
    console.log("Verifying on chain")
    setArgs([bytesToHex(provingArgs.proof), provingArgs.publicInputs as `0x${string}`[]]);
    setTimeout(()=> setArgs(undefined), 1000)}

  const generateProof = async (inputs: any) => {
    if (!inputs) return;

    const compiledCircuit = await compileCircuit(inputs.noir_program);
    const barretenbergBackend = new BarretenbergBackend(compiledCircuit, { threads: navigator.hardwareConcurrency });
    const noir = new Noir(compiledCircuit);

    await toast.promise(noir.init, {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });

    const { witness } = await toast.promise(noir.execute(inputs), {
      pending: 'ACVM Executing compiledCircuit --> Generating witness',
      success: 'Witness generated',
      error: 'Error generating witness',
    });
    if (!witness) return;

    const proofData = await toast.promise(barretenbergBackend.generateProof(witness), {
      pending: 'Generating proof',
      success: 'Proof generated',
      error: 'Error generating proof',
    });
    if (!proofData) return;
    setProvingArgs(proofData)
    setBackend(barretenbergBackend)
    setCurrentCompiledCircuit(compiledCircuit)
  };

  const getSpinnerElements = () => {
    const spinner = document.getElementById('spinner')!;
    const submitBtn = document.getElementById('submit')!;
    return [submitBtn, spinner];
  };

  const deactivateSpinner = () => {
    let [submitBtn, spinner] = getSpinnerElements();
    spinner.style.display = 'none';
    submitBtn.disabled = false;
  };

  const activateSpinner = () => {
    let [submitBtn, spinner] = getSpinnerElements();
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    /*try {
      await _submit(e); //TODO: not synchronous
    } catch {
      deactivateSpinner();
    }*/
    // the same as above but asynchronous?
    e.preventDefault();
    activateSpinner();
    _submit(e).then(() => {}).catch(() => {}).finally(() => {
      deactivateSpinner();
    });
  };

  const verifyOffChain = async function(){
    await toast.promise(backend.verifyProof(provingArgs), {
      pending: 'Verifying proof off-chain',
      success: 'Proof verified off-chain',
      error: 'Error verifying proof off-chain',
    });
  }

  const _submit = async (e: React.FormEvent<HTMLFormElement>) => {
    const elements = e.currentTarget.elements;
    if (!elements) return;

    const x = elements.namedItem('x') as HTMLInputElement;
    const y = elements.namedItem('y') as HTMLInputElement;
    const noir_program = elements.namedItem('noir_program') as HTMLInputElement;

    let inputs = {
      x: x.value,
      y: y.value,
      noir_program: noir_program.value,
    };

    await generateProof(inputs);
  };

  async function generateAndDeployContract(){
    console.log("Deploying")
    if (!currentCompiledCircuit) {
      console.log("Cannot generate contract because no circuit was provided")
      return;
    }
    let contractSourceCode = await generateVerifierContract(currentCompiledCircuit)
    console.log("Contract successfully created")
    console.log("Compiling and deploying contract")
    let address = await compileAndDeploy(contractSourceCode)
    setContractAddress(address)
  }

  const compileAndDeploy = async (contractSourceCode) => {
    const response = await fetch('/api/compile-and-deploy-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contractSourceCode }),
    });

    const response_data = await response.json();
    let contractAddress = response_data.object.contractAddress;
    console.log('Deployed contract address:', contractAddress);
    return contractAddress
  };

  const defaultCode = function(){
    return `fn main(x: Field, y:Field){ \n assert(x==y); \n }`
  }

  return (
    <>
      <form className="container" onSubmit={submit}>
        <h2>Noir <span className="funky-typography">Playground</span></h2>
        {connectDisconnectButton}
        <h4>Write you own noir circuit with <i>x</i> and <i>y</i> as input names</h4>
        <p>main.nr</p>
        <textarea className="program" name="noir_program" required={true} defaultValue={defaultCode()}/>
        <p>Try it!</p>
        <div className="inputs">
          <input className="text-input" name="x" type="text" placeholder="x" required={true} />
          <input className="text-input" name="y" type="text" placeholder="y" required={true} />
        </div>
        <div className="prove-options">
          <div className="prove-server-options">
            <p>On browser</p>
            <Switch onChange={(checked) => setProveOnServer(checked)} checked={proveOnServer} />
            <p>On server</p>
          </div>
          <button className="button prove-button" type="submit" id="submit">Calculate proof</button>
          <div className="spinner-button" id="spinner"></div>
        </div>
        <div className="actions-section">
        <div className="column-workflow">

            <button className="button verify-button" type="button" onClick={verifyOffChain}
                    disabled={!currentCompiledCircuit}>
              Verify off-chain
            </button>
          </div>
          <div className="column-workflow">
            <button className="button verify-button" type="button" onClick={generateAndDeployContract}
                    disabled={!currentCompiledCircuit || contractAddress}> Generate Verifier Contract
            </button>

            <div className="verify-button-container">
              {contractAddress && <p className='contract-address'>Contract deployed in address {contractAddress}</p>}
              <button className="button verify-button" type="button" onClick={verifyOnChain}
                      disabled={!contractAddress || !isConnected}>
                Verify on-chain
              </button>
            </div>
          </div>

        </div>
      </form>
    </>
  );
}

