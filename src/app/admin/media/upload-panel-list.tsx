"use client";

import { secondaryButtonClass } from "../promos/_kit/form-ui";
import type { UploadItem } from "./upload-panel-xhr";

/** Daftar progres unggah per berkas + tombol bersihkan. */
export function UploadProgressList({
  items,
  busy,
  onClear,
}: {
  items: UploadItem[];
  busy: boolean;
  onClear: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <ul className="space-y-2" aria-live="polite">
        {items.map((item) => (
          <li key={item.key} className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-neutral-800">{item.name}</span>
              <span
                className={`shrink-0 text-xs ${
                  item.status === "gagal"
                    ? "text-red-700"
                    : item.status === "selesai"
                      ? "text-green-700"
                      : "text-neutral-500"
                }`}
              >
                {item.status === "mengunggah" ? `Mengunggah ${item.progress}%` : item.status === "selesai" ? "Selesai" : item.status === "gagal" ? "Gagal" : "Menunggu"}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-neutral-100">
              <div
                className={`h-full ${item.status === "gagal" ? "bg-red-500" : "bg-neutral-900"}`}
                style={{ width: `${item.status === "gagal" ? 100 : item.progress}%` }}
              />
            </div>
            {item.error ? (
              <p role="alert" className="text-xs text-red-700">
                {item.error}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {!busy ? (
        <button type="button" onClick={onClear} className={secondaryButtonClass}>
          Bersihkan daftar
        </button>
      ) : null}
    </>
  );
}