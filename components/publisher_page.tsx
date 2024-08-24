"use client"
import styles from '../styles/Home.module.css'

import {handlePublisherForm} from "./server"
import ImageCropper from "@/app/ImageCropper";


import React, { useEffect, useState } from 'react';


export default function PublisherPage(){
  return <div>
    Hola Caro
  </div>
}

function PublisherForm() {

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);

  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedImageSize, setCroppedImageSize] = useState<{ width: number; height: number } | null>(null);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number } | null>(null);

  const handleOriginalImage = (image: string, size: { width: number; height: number }) => {
    setOriginalImage(image);
    setOriginalImageSize(size);
  };

  const handleCroppedImage = (image: string, size: { width: number; height: number }, offset: { x: number; y: number }) => {
    setCroppedImage(image);
    setCroppedImageSize(size);
    setCropOffset(offset);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prepare form data
    const formData = new FormData(event.currentTarget);
    if (originalImage) {
      formData.append('originalImage', originalImage); // Add original image data URL to FormData
    }
    if (croppedImage) {
      formData.append('croppedImage', croppedImage); // Add cropped image data URL to FormData
    }if (originalImageSize) {
      formData.append('originalImageWidth', originalImageSize.width.toString());
      formData.append('originalImageHeight', originalImageSize.height.toString());
    }
    if (croppedImageSize) {
      formData.append('croppedImageWidth', croppedImageSize.width.toString());
      formData.append('croppedImageHeight', croppedImageSize.height.toString());
    }
    if (cropOffset) {
      formData.append('cropOffsetX', cropOffset.x.toString());
      formData.append('cropOffsetY', cropOffset.y.toString());
    }
    handlePublisherForm(formData)
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">

        <ImageCropper onOriginalImage={handleOriginalImage} onCroppedImage={handleCroppedImage}/>
        <label>
          <span>Image signature: </span>
          <input type="text" name="signature"/>
        </label>
        <label>
          <span>Device key: </span>
          <input type="text" name="key"/>
        </label>
        <button type="submit" className={styles.proveButton}>
          Compile
        </button>
      </form>

    </div>
  );
}