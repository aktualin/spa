"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { MAX_BATCH_PHOTOS, precheckUploadFile } from "@/lib/domain/gallery";
import { ALLOWED_MEDIA_TYPES, formatBytes } from "@/lib/domain/media";

import { addPhotosAction } from "../actions/gallery";

type ItemStatus = "menunggu" | "mengunggah" | "berhasil" | "gagal";

type UploadItem = {
  key: string;
  name: string;
  size: number;
  status: ItemStatus;
  error: string | null;
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  menunggu: "Menunggu",
  mengunggah: "Mengunggah…",
  berhasil: "Terunggah",
  gagal: "Gagal",
};

const STATUS_CLASS: Record<ItemStatus, string> = {
  menunggu: "text-neutral-500",
  mengunggah: "text-blue-700",
  berhasil: "text-green-700",
  gagal: "text-red-700",
};

/** Unggah satu berkas ke /api/admin/upload. Tidak pernah melempar error. */
async function uploadOne(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "gallery");

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
 * Unggah banyak foto sekaligus: pra-validasi di browser → unggah satu per satu
 * (berkas gagal tidak menghentikan yang lain) → satu Server Action yang
 * menambahkan semua foto yang berhasil ke akhir album.
 */
export function BulkUploader({ albumId }: { albumId: string }) {
  const inputId = useId();
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
        const result = await uploadOne(file);
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

      const saved = await addPhotosAction(albumId, urls);
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
            ? `${saved.count ?? urls.length} foto ditambahkan ke album, ${failed} file gagal (lihat daftar di bawah).`
            : `${saved.count ?? urls.length} foto ditambahkan ke album.`,
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
        sekali unggah. Foto ditambahkan di urutan paling akhir; caption & alt text bisa
        diisi setelahnya.
      </p>

      {busy ? (
        <p role="status" className="text-sm text-blue-700">
          {remaining > 0
            ? `Mengunggah… ${done} selesai, ${remaining} tersisa.`
            : "Menyimpan foto ke album…"}
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
