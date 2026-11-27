export type UploadStatus = "menunggu" | "mengunggah" | "selesai" | "gagal";

export type UploadItem = {
  key: string;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

export const NEW_FOLDER = "__baru__";

/** Kirim satu berkas ke /api/admin/upload lewat XHR supaya progres terbaca. */
export function uploadOne(
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
      else if (xhr.status === 413) resolve({ ok: false, error: "File is too large (maximum 4 MB)." });
      else resolve({ ok: false, error: data.error ?? "Failed to upload file." });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Failed to reach the server." });
    xhr.send(body);
  });
}