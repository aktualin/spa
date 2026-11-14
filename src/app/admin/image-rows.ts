"use client";

import { useRef, useState } from "react";

import { moveInList } from "@/lib/domain/media";
import { compressImageForUpload } from "@/lib/image-compress-client";

export type ImageRow = { key: string; imageUrl: string; altText: string };

/**
 * State daftar gambar form admin: unggah berurutan ke /api/admin/upload,
 * tambah dari Media Library, geser urutan, dan hapus baris.
 */
export function useImageRows(
  folder: string,
  defaultImages: { imageUrl: string; altText: string | null }[],
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImageRow[]>(() =>
    defaultImages.map((image, index) => ({
      key: `awal-${index}`,
      imageUrl: image.imageUrl,
      altText: image.altText ?? "",
    })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keySeq = useRef(defaultImages.length);

  function addImages(urls: string[]) {
    if (urls.length === 0) return;
    setRows((current) => [
      ...current,
      ...urls.map((imageUrl) => ({
        key: `baru-${keySeq.current++}`,
        imageUrl,
        altText: "",
      })),
    ]);
  }

  async function handleFiles(files: File[]) {
    setBusy(true);
    setError(null);

    const uploaded: string[] = [];
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" bukan berkas gambar dan dilewati.`);
          continue;
        }

        const body = new FormData();
        body.append("file", await compressImageForUpload(file));
        body.append("folder", folder);

        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? `Gagal mengunggah "${file.name}".`);
          continue;
        }
        uploaded.push(data.url);
      }
      addImages(uploaded);
    } catch {
      setError("Gagal menghubungi server saat mengunggah.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(index: number, direction: "up" | "down") {
    setRows((current) => {
      const keys = current.map((row) => row.key);
      const nextKeys = moveInList(keys, current[index].key, direction);
      const byKey = new Map(current.map((row) => [row.key, row]));
      return nextKeys.map((key) => byKey.get(key)!);
    });
  }

  return { rows, setRows, busy, error, setError, fileRef, addImages, handleFiles, move };
}