"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { discardUploadAction, replaceMediaAction } from "../actions/media";

/**
 * Alur ganti berkas: unggah dulu lewat /api/admin/upload (validasi sama dengan
 * unggahan biasa, tidak terkena batas body Server Action 1 MB), lalu minta
 * server memindahkan berkas baru ke aset ini dan memperbarui semua pemakaian.
 */
export function useReplaceFile(id: string, folder: string, usageCount: number) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFile(file: File) {
    const warning =
      usageCount > 0
        ? `Ganti berkas ini? ${usageCount} pemakaian di situs akan langsung memakai gambar baru dan berkas lama dihapus.`
        : "Ganti berkas ini? Berkas lama akan dihapus.";
    if (!window.confirm(warning)) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setError(null);
    setMessage(null);
    setBusy("Mengunggah berkas baru…");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(
          response.status === 413
            ? "Berkas terlalu besar (maksimal 4 MB)."
            : (data.error ?? "Gagal mengunggah berkas."),
        );
        return;
      }

      setBusy("Memperbarui pemakaian…");
      const result = await replaceMediaAction(id, data.id);
      if (result.error) {
        setError(result.error);
        // Unggahan sementara tidak jadi dipakai — buang supaya tidak menumpuk.
        await discardUploadAction(data.id).catch(() => {});
        return;
      }

      setMessage(result.message ?? "Berkas berhasil diganti.");
      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Periksa Media Library: unggahan sementara mungkin perlu dihapus manual.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return { fileRef, busy, error, message, handleFile };
}