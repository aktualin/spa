"use client";

import { useId, useRef, useState } from "react";

import { compressImageForUpload } from "@/lib/image-compress-client";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { MediaPicker } from "./media-picker";

/**
 * Field gambar untuk form admin. Mengunggah ke /api/admin/upload lalu menyimpan
 * **URL-nya saja** ke hidden input, sehingga database hanya berisi URL.
 * Gambar yang sudah ada bisa dipilih ulang lewat "Pilih dari Media Library".
 */
export function ImageField({
  name,
  label,
  folder,
  defaultValue = "",
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFile(file: File) {
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
      setUrl(data.url);
    } catch {
      setError("Gagal menghubungi server saat mengunggah.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      {/* Nilai yang benar-benar dikirim ke Server Action. */}
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          {url ? (
            // Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi
            // dipakai <img> biasa alih-alih next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="size-full object-cover"
              onError={() => setError("Gambar tidak dapat dimuat.")}
            />
          ) : (
            <span className="text-[10px] text-neutral-400">kosong</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept={ALLOWED_MEDIA_TYPES.join(",")}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => setPickerOpen(true)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Pilih dari Media Library
          </button>

          <p className="text-xs text-neutral-500">
            {busy ? "Mengunggah…" : "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB."}
          </p>

          {url ? (
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-neutral-500">
                {url}
              </p>
              <button
                type="button"
                onClick={() => setUrl("")}
                className="shrink-0 text-xs text-red-700 hover:underline"
              >
                Hapus
              </button>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-xs text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setUrl(asset.url);
          setError(null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
