import './publisher_page.css';

import ImageCropper from './ImageCropper.tsx';
import hashPersonalizado from './compute_hash.js';
import generateNoirSourceCodeForVerification from './compute_full_circuit.js'

import { base64ToRgbAndSize } from './utils.js';

import React, { useState } from 'react';
import { convertPhotoToFieldElement } from '../circuit/utils';
import { compileCircuit } from '../circuit/compile.ts';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { toast } from 'react-toastify';
import { generateVerifierContract } from './contract.ts';


export default function PublisherForm() {

  const [currentCompiledCircuit, setCurrentCompiledCircuit] = useState();
  const [originalImage, setOriginalImage] = useState();
  const [originalImageSize, setOriginalImageSize] = useState();

  const [croppedImage, setCroppedImage] = useState();
  const [croppedImageSize, setCroppedImageSize] = useState();
  const [cropOffset, setCropOffset] = useState();

  const handleOriginalImage = (image, size) => {
    setOriginalImage(image);
    setOriginalImageSize(size);
  };

  const handleCroppedImage = (image, size, offset) => {
    setCroppedImage(image);
    setCroppedImageSize(size);
    setCropOffset(offset);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    let ogPhotoDataBytes = await base64ToRgbAndSize(originalImage);
    const ogPhotoField = convertPhotoToFieldElement(ogPhotoDataBytes.rgb);

    const { originalPhotoHash } = await toast.promise(hashPersonalizado(
                                                        ogPhotoField,
                                                        originalImageSize.height,
                                                        originalImageSize.width), {
      pending: 'Generating compressed hash',
      success: 'Hash generated',
      error: 'Error generating hash',
    });
    /*let originalPhotoHash = await hashPersonalizado(
      ogPhotoField,
      originalImageSize.height,
      originalImageSize.width);*/

    let crPhotoDataBytes = await base64ToRgbAndSize(croppedImage);
    const crPhotoField = convertPhotoToFieldElement(crPhotoDataBytes.rgb);


    let dataForGeneratingTheCircuit = {
      originalImageWidth: originalImageSize.width,
      originalImageHeight: originalImageSize.height,
      croppedImageWidth: croppedImageSize.width,
      croppedImageHeight: croppedImageSize.height,
      cropOffsetX: cropOffset.x,
      cropOffsetY: cropOffset.y,
    };

    let dataForPublicInput = {
      original: ogPhotoField,
      cropped: crPhotoField,
      hash: originalPhotoHash,
    };

    let noirSourceCode = generateNoirSourceCodeForVerification(
      dataForGeneratingTheCircuit.originalImageHeight,
      dataForGeneratingTheCircuit.originalImageWidth,
      dataForGeneratingTheCircuit.croppedImageHeight,
      dataForGeneratingTheCircuit.croppedImageWidth,
      dataForGeneratingTheCircuit.cropOffsetY,
      dataForGeneratingTheCircuit.cropOffsetX,
    )

    // ---------- CIRCUIT --------- //
    const compiledCircuit = await compileCircuit(noirSourceCode);
    console.log("circuit compiled")
    await setCurrentCompiledCircuit(compiledCircuit);
    //const barretenbergBackend = new BarretenbergBackend(compiledCircuit, { threads: navigator.hardwareConcurrency });

    const noir = new Noir(compiledCircuit);

    await toast.promise(noir.init, {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });

    /*const { witness } = await toast.promise(noir.execute(dataForPublicInput), {
      pending: 'ACVM Executing compiledCircuit --> Generating witness',
      success: 'Witness generated',
      error: 'Error generating witness',
    });
    if (!witness) return;*/

    /*const proofData = await toast.promise(barretenbergBackend.generateProof(witness), {
      pending: 'Generating proof',
      success: 'Proof generated',
      error: 'Error generating proof',
    });

    console.log(proofData)*/

    let address = generateAndDeployContract()

    let dataTheReaderNeeds = {
      croppedImage,
      address,
      //proofData,
    }


  };

  const getSpinnerElements = () => {
    const spinner = document.getElementById('spinner');
    const submitBtn = document.getElementById('submit');
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

  async function generateAndDeployContract() {
    console.log("Deploying")
    if (!currentCompiledCircuit) {
      console.log("Cannot generate contract because no circuit was provided")
      return;
    }
    let contractSourceCode = await generateVerifierContract(currentCompiledCircuit)
    console.log("Contract successfully created")
    console.log("Compiling and deploying contract")
    let address = await compileAndDeploy(contractSourceCode)

    return address
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

  return (
    <main className={'container'}>
      <h1 className={'title'}>Publisher</h1>
      <form className={'formContent'} onSubmit={onSubmit}>
        <ImageCropper onOriginalImage={handleOriginalImage} onCroppedImage={handleCroppedImage} />
        <button type="submit" className='proveButton' disabled={!croppedImage}>Compile</button>
      </form>
    </main>
  );
}