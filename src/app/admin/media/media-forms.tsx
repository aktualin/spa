"use client";

import { useRouter } from "next/navigation";
import { useActionState, useId, useRef, useState } from "react";

import { ALLOWED_MEDIA_TYPES, MAX_DISPLAY_NAME } from "@/lib/domain/media";

import {
  discardUploadAction,
  replaceMediaAction,
  updateMediaAction,
  type ActionState,
} from "../actions/media";
import { ErrorAlert, Field, SaveButton, inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

/** Ubah judul, alt text, dan nama file tampilan. */
export function MediaMetaForm({
  id,
  fileName,
  title,
  altText,
}: {
  id: string;
  fileName: string;
  title: string;
  altText: string;
}) {
  const [state, formAction] = useActionState(updateMediaAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <Field
        label="Nama file"
        htmlFor="media-fileName"
        hint={`Nama tampilan di Media Library (maksimal ${MAX_DISPLAY_NAME} karakter, tanpa / atau \\). Alamat URL berkas tidak berubah.`}
      >
        <input
          id="media-fileName"
          name="fileName"
          defaultValue={fileName}
          required
          maxLength={MAX_DISPLAY_NAME}
          className={inputClass}
        />
      </Field>

      <Field label="Judul" htmlFor="media-title" hint="Opsional, membantu pencarian.">
        <input id="media-title" name="title" defaultValue={title} maxLength={200} className={inputClass} />
      </Field>

      <Field
        label="Teks alternatif (alt)"
        htmlFor="media-altText"
        hint="Deskripsi singkat isi gambar untuk pembaca layar dan mesin pencari."
      >
        <input id="media-altText" name="altText" defaultValue={altText} maxLength={300} className={inputClass} />
      </Field>

      <ErrorAlert message={state.error} />
      <SaveButton />
    </form>
  );
}

/** Tombol salin URL publik berkas ke clipboard. */
export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={secondaryButtonClass}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Salin URL berikut:", url);
        }
      }}
    >
      {copied ? "URL tersalin" : "Salin URL"}
    </button>
  );
}

/**
 * Ganti berkas: unggah dulu lewat /api/admin/upload (validasi sama dengan
 * unggahan biasa, tidak terkena batas body Server Action 1 MB), lalu minta
 * server memindahkan berkas baru ke aset ini dan memperbarui semua pemakaian.
 */
export function ReplaceFileForm({
  id,
  folder,
  usageCount,
}: {
  id: string;
  folder: string;
  usageCount: number;
}) {
  const router = useRouter();
  const inputId = useId();
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

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
        Ganti berkas
      </label>
      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept={ALLOWED_MEDIA_TYPES.join(",")}
        disabled={busy !== null}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
      />
      <p className="text-xs text-neutral-500">
        {busy ??
          "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB. Berkas baru mendapat alamat baru; semua konten yang memakai berkas ini ikut diperbarui."}
      </p>
      {message ? (
        <p role="status" className="text-xs text-green-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
