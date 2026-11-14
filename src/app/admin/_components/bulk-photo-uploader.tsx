"use client";

import { useId } from "react";

import { MAX_BATCH_PHOTOS } from "@/lib/domain/gallery";
import { ALLOWED_MEDIA_TYPES, formatBytes } from "@/lib/domain/media";

import { useBulkUpload } from "./bulk-upload-hook";
import { STATUS_CLASS, STATUS_LABEL } from "./bulk-upload-shared";

/**
 * UI unggah banyak foto sekaligus (dipakai Gallery dan Events). `noun`
 * menyebut tujuan foto ("album" / "galeri event") di pesan status.
 */
export function BulkPhotoUploader({
  folder,
  noun,
  hintTail,
  onSave,
}: {
  folder: string;
  noun: string;
  hintTail: string;
  onSave: (urls: string[]) => Promise<{ error: string | null; count?: number }>;
}) {
  const inputId = useId();
  const { fileRef, items, busy, message, handleFiles } = useBulkUpload(folder, noun, onSave);

  const done = items.filter((item) => item.status === "berhasil").length;
  const remaining = items.filter(
    (item) => item.status === "menunggu" || item.status === "mengunggah",
  ).length;

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
        Pilih beberapa foto sekaligus
      </label>
      <input
        id={inputId}
        ref={fileRef}
        type="file"
        multiple
        accept={ALLOWED_MEDIA_TYPES.join(",")}
        disabled={busy}
        onChange={(event) => {
          const files = event.target.files;
          if (files) void handleFiles(files);
        }}
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
      />
      <p className="text-xs text-neutral-500">
        JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per file dan {MAX_BATCH_PHOTOS} file
        sekali unggah. Foto ditambahkan di urutan paling akhir; {hintTail}
      </p>

      {busy ? (
        <p role="status" className="text-sm text-blue-700">
          {remaining > 0
            ? `Mengunggah… ${done} selesai, ${remaining} tersisa.`
            : `Menyimpan foto ke ${noun}…`}
        </p>
      ) : null}

      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={
            message.tone === "error"
              ? "rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
              : "rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
          }
        >
          {message.text}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-neutral-800">{item.name}</span>
              <span className="text-xs text-neutral-500">{formatBytes(item.size)}</span>
              <span className={`text-xs font-medium ${STATUS_CLASS[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
              {item.error ? (
                <span className="basis-full text-xs text-red-700">{item.error}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}