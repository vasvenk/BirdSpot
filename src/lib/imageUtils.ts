"use client";

import imageCompression from "browser-image-compression";

async function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function prepareUploadImages(file: File) {
  const full = await imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.35,
    initialQuality: 0.7,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const thumbnail = await imageCompression(file, {
    maxWidthOrHeight: 400,
    maxSizeMB: 0.12,
    initialQuality: 0.65,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const [imageData, thumbnailData] = await Promise.all([
    fileToDataUrl(full),
    fileToDataUrl(thumbnail),
  ]);

  return { imageData, thumbnailData };
}

export async function fileToAvatarDataUrl(file: File) {
  const avatar = await imageCompression(file, {
    maxWidthOrHeight: 320,
    maxSizeMB: 0.12,
    initialQuality: 0.75,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  return fileToDataUrl(avatar);
}
