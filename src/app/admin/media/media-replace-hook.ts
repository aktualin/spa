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
        ? `Replace this file? ${usageCount} usages on the site will immediately use the new image and the old file will be deleted.`
        : "Replace this file? The old file will be deleted.";
    if (!window.confirm(warning)) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setError(null);
    setMessage(null);
    setBusy("Uploading new file…");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(
          response.status === 413
            ? "File is too large (maximum 4 MB)."
            : (data.error ?? "Failed to upload file."),
        );
        return;
      }

      setBusy("Updating usages…");
      const result = await replaceMediaAction(id, data.id);
      if (result.error) {
        setError(result.error);
        // Unggahan sementara tidak jadi dipakai — buang supaya tidak menumpuk.
        await discardUploadAction(data.id).catch(() => {});
        return;
      }

      setMessage(result.message ?? "File replaced successfully.");
      router.refresh();
    } catch {
      setError("Failed to reach the server. Check the Media Library: the temporary upload may need to be deleted manually.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return { fileRef, busy, error, message, handleFile };
}