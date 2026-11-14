"use client";

import { useRef, useState } from "react";

import { compressImageForUpload } from "@/lib/image-compress-client";

/**
 * Unggah satu gambar lewat /api/admin/upload lalu serahkan URL hasilnya ke
 * pemanggil (disisipkan ke editor teks kaya, atau disimpan field gambar).
 */
export function useInlineImageUpload(folder: string, insertImage: (url: string) => void) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", await compressImageForUpload(file));
      body.append("folder", folder);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengunggah gambar.");
        return;
      }
      insertImage(data.url);
    } catch {
      setError("Gagal menghubungi server saat mengunggah.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return { fileRef, busy, error, setError, uploadImage };
}