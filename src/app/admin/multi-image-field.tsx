"use client";

import { useId, useRef, useState } from "react";

import { ALLOWED_MEDIA_TYPES, moveInList } from "@/lib/domain/media";
import { compressImageForUpload } from "@/lib/image-compress-client";

import { MediaPicker } from "./media-picker";

type ImageRow = { key: string; imageUrl: string; altText: string };

/**
 * Field gambar banyak untuk form admin. Mengunggah ke /api/admin/upload lalu
 * menyimpan **URL-nya saja** ke hidden input `contentImages[i][imageUrl]` +
 * `[altText]`, sehingga database hanya berisi URL. Urutan daftar = urutan
 * tampil (carousel) di halaman publik.
 */
export function MultiImageField({
  label,
  folder,
  defaultImages = [],
  name = "contentImages",
}: {
  label: string;
  folder: string;
  defaultImages?: { imageUrl: string; altText: string | null }[];
  name?: string;
}) {
  const inputId = useId();
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
  const [pickerOpen, setPickerOpen] = useState(false);
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

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <p className="text-xs text-neutral-500">
        Urutan pertama tampil paling awal. Bila lebih dari satu gambar, halaman
        publik menampilkannya sebagai carousel. Maksimal 12 gambar.
      </p>

      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="flex items-start gap-3 rounded-md border border-neutral-200 p-2"
            >
              {/* Nilai yang benar-benar dikirim ke Server Action. */}
              <input type="hidden" name={`${name}[${index}][imageUrl]`} value={row.imageUrl} />
              <input type="hidden" name={`${name}[${index}][altText]`} value={row.altText} />

              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                {/* Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi
                    dipakai <img> biasa alih-alih next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.imageUrl}
                  alt=""
                  className="size-full object-cover"
                  onError={() => setError("Salah satu gambar tidak dapat dimuat.")}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  aria-label={`Teks alt gambar ${index + 1}`}
                  value={row.altText}
                  maxLength={160}
                  placeholder="Teks alt (opsional)"
                  onChange={(event) =>
                    setRows((current) =>
                      current.map((r) =>
                        r.key === row.key ? { ...r, altText: event.target.value } : r,
                      ),
                    )
                  }
                  className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900"
                />

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    aria-label={`Naikkan gambar ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => move(index, "up")}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Turunkan gambar ${index + 1}`}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, "down")}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRows((current) => current.filter((r) => r.key !== row.key))
                    }
                    className="ml-auto text-red-700 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-500">
          Belum ada gambar tambahan.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          multiple
          disabled={busy}
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            if (files.length > 0) void handleFiles(files);
          }}
          className="block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => setPickerOpen(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Pilih dari Media Library
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        {busy ? "Mengunggah…" : "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per gambar."}
      </p>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          addImages([asset.url]);
          setError(null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
