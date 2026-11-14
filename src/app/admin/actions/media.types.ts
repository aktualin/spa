export type ActionState = { error: string | null; ok?: boolean; message?: string };

export type MediaUsage = {
  /** Label kolom, mis. "Treatment" atau "Journal (isi)". */
  label: string;
  /** Nama/judul baris yang memakai berkas. */
  name: string;
  /** Halaman admin untuk mengubah baris tersebut, bila ada. */
  href: string | null;
};

export type PickerAsset = {
  id: string;
  url: string;
  fileName: string;
  title: string | null;
  altText: string | null;
  folder: string;
  mimeType: string;
};

export type MediaListItem = {
  id: string;
  url: string;
  fileName: string;
  title: string | null;
  altText: string | null;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  sortOrder: number;
  createdAt: Date;
  usageCount: number;
};