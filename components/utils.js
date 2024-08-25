export async function base64ToRgbAndSize(base64Image) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Dibujamos la imagen en el canvas
      ctx.drawImage(img, 0, 0);

      // Obtenemos los datos de los píxeles
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const rgbData = imageData.data; // Contiene los valores RGBA consecutivamente

      let rgbArray = [];
      for (let i = 0; i < rgbData.length; i += 4) {
        const r = rgbData[i];
        const g = rgbData[i + 1];
        const b = rgbData[i + 2];

        rgbArray.push([r, g, b]);
      }

      resolve({
        width: img.width,
        height: img.height,
        rgb: rgbArray
      });
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
}

export const convertToOneElement = rgb => rgb[0]*256*256 + rgb[1]*256 + rgb[2];
export const convertPhotoToFieldElement = photo => photo.map(convertToOneElement);