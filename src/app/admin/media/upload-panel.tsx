"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";

type UploadStatus = "menunggu" | "mengunggah" | "selesai" | "gagal";

type UploadItem = {
  key: string;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

const NEW_FOLDER = "__baru__";

/** Kirim satu berkas ke /api/admin/upload lewat XHR supaya progres terbaca. */
function uploadOne(
  file: File,
  folder: string,
  onProgress: (percent: number) => void,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const data = (xhr.response ?? {}) as { error?: string };
      if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true });
      else if (xhr.status === 413) resolve({ ok: false, error: "Berkas terlalu besar (maksimal 4 MB)." });
      else resolve({ ok: false, error: data.error ?? "Gagal mengunggah berkas." });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Gagal menghubungi server." });
    xhr.send(body);
  });
}

/** Unggah banyak berkas sekaligus; dikirim satu per satu dengan progres masing-masing. */
export function UploadPanel({ folders }: { folders: string[] }) {
  const router = useRouter();
  const fileId = useId();
  const folderId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [folderChoice, setFolderChoice] = useState(folders[0] ?? "misc");
  const [newFolder, setNewFolder] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);

  const options = folders.includes("misc") ? folders : [...folders, "misc"];
  const targetFolder =
    folderChoice === NEW_FOLDER
      ? newFolder.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
      : folderChoice;

  function patch(key: string, change: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...change } : item)));
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const batch = files.map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      progress: 0,
      status: "menunggu" as UploadStatus,
    }));
    setItems(batch);
    setBusy(true);

    let succeeded = 0;
    for (const [index, file] of files.entries()) {
      const { key } = batch[index];
      patch(key, { status: "mengunggah" });
      const result = await uploadOne(file, targetFolder || "misc", (progress) => patch(key, { progress }));
      if (result.ok) {
        succeeded += 1;
        patch(key, { status: "selesai", progress: 100 });
      } else {
        patch(key, { status: "gagal", error: result.error });
      }
    }

    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (succeeded > 0) router.refresh();
  }

  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Unggah berkas</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={folderId} className="block text-sm font-medium text-neutral-700">
            Folder tujuan
          </label>
          <select
            id={folderId}
            value={folderChoice}
            disabled={busy}
            onChange={(event) => setFolderChoice(event.target.value)}
            className={inputClass}
          >
            {options.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
            <option value={NEW_FOLDER}>+ Folder baru…</option>
          </select>
          {folderChoice === NEW_FOLDER ? (
            <input
              aria-label="Nama folder baru"
              value={newFolder}
              disabled={busy}
              onChange={(event) => setNewFolder(event.target.value)}
              placeholder="mis. interior"
              className={inputClass}
            />
          ) : null}
          <p className="text-xs text-neutral-500">
            Nama folder hanya huruf kecil, angka, dan tanda hubung.
            {folderChoice === NEW_FOLDER && targetFolder ? ` Disimpan sebagai “${targetFolder}”.` : ""}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={fileId} className="block text-sm font-medium text-neutral-700">
            Berkas gambar
          </label>
          <input
            id={fileId}
            ref={fileRef}
            type="file"
            multiple
            accept={ALLOWED_MEDIA_TYPES.join(",")}
            disabled={busy || (folderChoice === NEW_FOLDER && !targetFolder)}
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files);
            }}
            className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
          />
          <p className="text-xs text-neutral-500">
            Boleh memilih beberapa berkas sekaligus. JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per berkas.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
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
      ) : null}

      {items.length > 0 && !busy ? (
        <button type="button" onClick={() => setItems([])} className={secondaryButtonClass}>
          Bersihkan daftar
        </button>
      ) : null}
    </section>
  );
}
