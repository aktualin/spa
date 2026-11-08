"use client";

import { useId, useRef, useState } from "react";

import { precheckUploadFile } from "@/lib/domain/gallery";
import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { MediaPicker } from "../../media-picker";
import { secondaryButtonClass } from "../../promos/_kit/form-ui";

/** Unggah satu berkas ke /api/admin/upload. Tidak pernah melempar error. */
async function uploadOne(file: File, folder: string): Promise<{ url: string } | { error: string }> {
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;
    if (!response.ok || !data?.url) {
      if (response.status === 413) return { error: "Ukuran file melebihi batas 4 MB." };
      return { error: data?.error ?? "Gagal mengunggah gambar." };
    }
    return { url: data.url };
  } catch {
    return { error: "Gagal menghubungi server saat mengunggah." };
  }
}

/**
 * Daftar foto dokumentasi (banyak foto): unggah beberapa sekaligus, pilih dari
 * Media Library, urutkan ↑/↓, hapus. Setiap URL dikirim sebagai `name`
 * berulang; urutan = urutan tampil. Diadaptasi dari pengunggah massal Gallery.
 */
export function PhotoListField({
  name,
  label,
  folder,
  defaultValue,
  max,
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue: string[];
  max: number;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  function add(url: string) {
    setUrls((current) => (current.includes(url) ? current : [...current, url]));
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const room = max - urls.length;
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

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">{label}</legend>

      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {urls.length === 0 ? (
        <p className="text-sm text-neutral-500">Belum ada foto.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, index) => (
            <li key={url} className="space-y-1.5 rounded-md border border-neutral-200 p-2">
              <div className="aspect-[3/4] overflow-hidden rounded bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-auto text-xs text-neutral-500">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Naikkan foto ${index + 1}`}
                  className={secondaryButtonClass}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === urls.length - 1}
                  aria-label={`Turunkan foto ${index + 1}`}
                  className={secondaryButtonClass}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setUrls((current) => current.filter((u) => u !== url))}
                  aria-label={`Lepas foto ${index + 1}`}
                  className={`${secondaryButtonClass} text-red-700`}
                >
                  Lepas
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm text-neutral-700">
          Unggah beberapa foto sekaligus
        </label>
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          multiple
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          disabled={busy || urls.length >= max}
          onChange={(event) => {
            const files = event.target.files;
            if (files) void handleFiles(files);
          }}
          className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={busy || urls.length >= max}
          onClick={() => setPickerOpen(true)}
          className={secondaryButtonClass}
        >
          Pilih dari Media Library
        </button>
        <p className="text-xs text-neutral-500">
          JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per file dan {max} foto per klien.
          &quot;Lepas&quot; hanya melepas foto dari klien ini — berkasnya tetap ada di Media
          Library. Perubahan tersimpan setelah menekan Simpan.
        </p>
        {progress ? (
          <p role="status" className="text-sm text-blue-700">
            {progress}
          </p>
        ) : null}
        {errors.length > 0 ? (
          <ul role="alert" className="space-y-0.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          if (urls.length < max) add(asset.url);
          setPickerOpen(false);
        }}
      />
    </fieldset>
  );
}
