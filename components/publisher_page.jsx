import './publisher_page.css';

import ImageCropper from './ImageCropper.tsx';
import hashPersonalizado from './compute_hash.js';

import { base64ToRgbAndSize } from './utils.js';

import React, { useState } from 'react';
import { convertPhotoToBitsArray, convertPhotoToFieldElement, hexToBits } from '../circuit/utils';
import fs from 'node:fs/promises';


export default function PublisherPage() {
  return <div>
    {PublisherForm()}
  </div>;
}

function PublisherForm() {

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
    let originalPhotoHash = hashPersonalizado(
      ogPhotoField,
      originalImageSize.height,
      originalImageSize.width);

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
      originalImageField: ogPhotoField,
      croppedImageField: crPhotoField,
      hash: originalPhotoHash,
    };
  };

  return (
    <main className={'container'}>
      <h1 className={'title'}>Publisher</h1>
      <form className={'formContent'} onSubmit={onSubmit}>
        <ImageCropper onOriginalImage={handleOriginalImage} onCroppedImage={handleCroppedImage} />
        <button type="submit" className={'proveButton'}>Compile</button>
      </form>
    </main>
  );
}