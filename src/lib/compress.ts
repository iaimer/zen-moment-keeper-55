const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

export function compressImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const tryCompress = (q: number) => {
        canvas.toBlob(
          (result) => {
            if (!result) { resolve(blob); return; }
            if (result.size <= MAX_IMAGE_SIZE || q <= 0.1) {
              resolve(result);
            } else {
              tryCompress(q - 0.1);
            }
          },
          'image/jpeg',
          q
        );
      };

      if (blob.size <= MAX_IMAGE_SIZE) {
        resolve(blob);
      } else {
        tryCompress(0.9);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}
