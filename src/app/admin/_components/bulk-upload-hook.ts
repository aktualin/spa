"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { MAX_BATCH_PHOTOS, precheckUploadFile } from "@/lib/domain/gallery";

import { uploadOne, type ItemStatus, type UploadItem } from "./bulk-upload-shared";

/**
 * Logika unggah banyak foto: pra-validasi di browser → unggah satu per satu
 * (berkas gagal tidak menghentikan yang lain) → satu Server Action yang
 * menambahkan semua foto yang berhasil ke akhir daftar.
 */
export function useBulkUpload(
  folder: string,
  noun: string,
  onSave: (urls: string[]) => Promise<{ error: string | null; count?: number }>,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  function patch(key: string, change: Partial<UploadItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...change } : item)),
    );
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setMessage(null);
    if (files.length > MAX_BATCH_PHOTOS) {
      setItems([]);
      setMessage({
        tone: "error",
        text: `Maksimal ${MAX_BATCH_PHOTOS} foto sekali unggah. Anda memilih ${files.length} file.`,
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const batch = files.map((file, index) => {
      const error = precheckUploadFile(file);
      return {
        file,
        item: {
          key: `${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          status: (error ? "gagal" : "menunggu") as ItemStatus,
          error,
        },
      };
    });
    setItems(batch.map((entry) => entry.item));
    setBusy(true);

    const urls: string[] = [];
    try {
      for (const { file, item } of batch) {
        if (item.status === "gagal") continue;
        patch(item.key, { status: "mengunggah" });
        const result = await uploadOne(file, folder);
        if ("url" in result) {
          urls.push(result.url);
          patch(item.key, { status: "berhasil" });
        } else {
          patch(item.key, { status: "gagal", error: result.error });
        }
      }

      const failed = batch.length - urls.length;
      if (urls.length === 0) {
        setMessage({ tone: "error", text: "Tidak ada foto yang berhasil diunggah." });
        return;
      }

      const saved = await onSave(urls);
      if (saved.error) {
        setMessage({
          tone: "error",
          text: `${saved.error} Berkas yang terunggah tetap tersimpan di Media Library.`,
        });
        return;
      }

      setMessage({
        tone: failed > 0 ? "error" : "ok",
        text:
          failed > 0
            ? `${saved.count ?? urls.length} foto ditambahkan ke ${noun}, ${failed} file gagal (lihat daftar di bawah).`
            : `${saved.count ?? urls.length} foto ditambahkan ke ${noun}.`,
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return { fileRef, items, busy, message, handleFiles };
}