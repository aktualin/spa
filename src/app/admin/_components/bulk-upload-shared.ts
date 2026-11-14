export type ItemStatus = "menunggu" | "mengunggah" | "berhasil" | "gagal";

export type UploadItem = {
  key: string;
  name: string;
  size: number;
  status: ItemStatus;
  error: string | null;
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  menunggu: "Menunggu",
  mengunggah: "Mengunggah…",
  berhasil: "Terunggah",
  gagal: "Gagal",
};

export const STATUS_CLASS: Record<ItemStatus, string> = {
  menunggu: "text-neutral-500",
  mengunggah: "text-blue-700",
  berhasil: "text-green-700",
  gagal: "text-red-700",
};

/** Unggah satu berkas ke /api/admin/upload. Tidak pernah melempar error. */
export async function uploadOne(file: File, folder: string): Promise<{ url: string } | { error: string }> {
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