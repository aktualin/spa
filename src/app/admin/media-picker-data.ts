"use client";

import { useEffect, useState } from "react";

import { listMediaForPicker, listMediaFolders, type PickerAsset } from "./actions/media";

/** Muat daftar folder + aset Media Library saat dialog terbuka. */
export function usePickerAssets(open: boolean, folder: string, q: string) {
  const [folders, setFolders] = useState<string[]>([]);
  const [assets, setAssets] = useState<PickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listMediaFolders()
      .then((rows) => {
        if (!cancelled) setFolders(rows.map((row) => row.folder));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Muat ulang daftar saat filter berubah (pencarian ditunda sejenak).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      listMediaForPicker({ folder: folder || undefined, q: q || undefined })
        .then((rows) => {
          if (!cancelled) setAssets(rows);
        })
        .catch(() => {
          if (!cancelled) setError("Gagal memuat Media Library.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, folder, q]);

  return { folders, assets, loading, error };
}