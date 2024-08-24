import React, { useState } from 'react';
import './reader_page.css'
import { TiTick } from "react-icons/ti";


export default function ReaderPage() {
  return (
    <div className={"reader-page"}>
      <h1 className="title">PhotoLock catalog</h1>
      <VerifiablePhotoFrame
        croppedPhotoSrc={"../example_images/perfil.jpeg"}
        publicKey={"0x1234567890abcdef"}
        originalPhotoHash={"0x1234567890abcdef"}
        originalPhotoSignature={"0x1234567890abcdef"}
        proof={"0x1234567890abcdef"}
        verificationContractAddress={"0x1234567890abcdef"}
      />
    </div>
  );
}

function VerifiablePhotoFrame({
  croppedPhotoSrc, publicKey, originalPhotoHash, originalPhotoSignature, proof, verificationContractAddress
}) {

  const onPress = async () => {
    console.log("Pressed");
    let button = document.getElementById("verify-button")
    button.remove()
    let text = document.getElementById("button-verified")
    text.classList.remove("hidden")
  }

  return <div className={"photo-frame"}>
    <img src={croppedPhotoSrc} className={"image-container"}/>
    <div className={"photo-frame-footer"}>
      <button id="verify-button" className={"verify-button"} type={"button"} onClick={onPress}>
        Verify authenticity
      </button>
      <div className={"button-verified hidden"} id="button-verified">
        <TiTick /><p>Verified by PhotoLock</p>
      </div>
    </div>
  </div>
}