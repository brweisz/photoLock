import React, { useEffect, useState } from 'react';
import './reader_page.css'
import { TiTick } from "react-icons/ti";
import { createUseReadContract } from 'wagmi/codegen';
import { ultraVerifierAbi } from '../hooks/verifierContractABI.ts';
import { useOnChainVerification } from '../hooks/useOnChainVerification.tsx';
import { bytesToHex } from 'viem';


export default function ReaderPage() {
  let { isConnected, connectDisconnectButton, address } = useOnChainVerification();

  return (
    <div className={"reader-page"}>
      {connectDisconnectButton}
      <h1 className="title">PhotoLock catalog</h1>
      <VerifiablePhotoFrame
        croppedPhotoSrc={"../example_images/perfil.jpeg"}
        publicKey={"0x1234567890abcdef"}
        originalPhotoHash={"0x1234567890abcdef"}
        originalPhotoSignature={"0x1234567890abcdef"}
        proof={"0x1234567890abcdef"}
        verificationContractAddress={"0x1234567890abcdef"}
        isConnected = {isConnected}
      />
    </div>
  );
}

function VerifiablePhotoFrame({
  croppedPhotoSrc, publicKey, originalPhotoHash, originalPhotoSignature, proof, verificationContractAddress, isConnected
}) {

  useEffect(() => {
    setContractAddress(verificationContractAddress);
  })

  // ---------- VERIFICATION THINGS ---------- //
  let [contractAddress, setContractAddress] = useState();
  const [args, setArgs] = useState();
  let useReadUltraVerifierVerify = createUseReadContract({
    abi: ultraVerifierAbi,
    address: contractAddress,
    functionName: 'verify',
  })
  const { data, error } = useReadUltraVerifierVerify({args, query: {enabled: !!args}});
  // ---------------------------------------- //

  const onPress = async () => {
    let publicInputs = { // cuidado con los nombres exactos de esto
      publicKey,
      originalPhotoHash,
      originalPhotoSignature
    }
    setArgs([bytesToHex(proof), Object.values(publicInputs).map(value => `0x${value}`)]);

    let button = document.getElementById("verify-button")
    // button.remove()
    let text = document.getElementById("button-verified")
    text.classList.remove("hidden")
  }

  return <div className={"photo-frame"}>
    <img src={croppedPhotoSrc} className={"image-container"}/>
    <div className={"photo-frame-footer"}>
      <button id="verify-button" className={"verify-button"} type={"button"} onClick={onPress} disabled={!isConnected}>
        Verify authenticity
      </button>
      {!isConnected && <p>Must connect wallet</p>}
      <div className={"button-verified hidden"} id="button-verified">
        <TiTick /><p>Verified by PhotoLock</p>
      </div>
    </div>
  </div>
}