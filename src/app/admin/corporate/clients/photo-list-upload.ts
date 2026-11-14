"use client";

import { useRef, useState } from "react";

import { precheckUploadFile } from "@/lib/domain/gallery";

import { uploadOne } from "../../_components/bulk-upload-shared";

/** Unggah beberapa foto dokumentasi sekaligus, dengan batas jumlah foto. */
export function usePhotoListUpload(
  folder: string,
  max: number,
  count: number,
  add: (url: string) => void,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const room = max - count;
    const problems: string[] = [];
    if (files.length > room) {
      problems.push(
        `Maksimal ${max} foto per klien — ${files.length - Math.max(0, room)} file tidak diunggah.`,
      );
    }

    setBusy(true);
    setErrors([]);
    try {
      const batch = files.slice(0, Math.max(0, room));
      for (const [index, file] of batch.entries()) {
        const precheck = precheckUploadFile(file);
        if (precheck) {
          problems.push(`${file.name}: ${precheck}`);
          continue;
        }
        setProgress(`Mengunggah ${index + 1} dari ${batch.length}…`);
        const result = await uploadOne(file, folder);
        if ("url" in result) add(result.url);
        else problems.push(`${file.name}: ${result.error}`);
      }
    } finally {
      setBusy(false);
      setProgress(null);
      setErrors(problems);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return { fileRef, busy, progress, errors, handleFiles };
}