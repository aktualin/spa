export type ItemStatus = "menunggu" | "mengunggah" | "berhasil" | "gagal";

export type UploadItem = {
  key: string;
  name: string;
  size: number;
  status: ItemStatus;
  error: string | null;
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  menunggu: "Waiting",
  mengunggah: "Uploading…",
  berhasil: "Uploaded",
  gagal: "Failed",
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
      if (response.status === 413) return { error: "File size exceeds the 4 MB limit." };
      return { error: data?.error ?? "Failed to upload the image." };
    }
    return { url: data.url };
  } catch {
    return { error: "Failed to reach the server while uploading." };
  }
}