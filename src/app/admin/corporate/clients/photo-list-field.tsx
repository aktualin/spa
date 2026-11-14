"use client";

import { useId, useState } from "react";

import { MediaPicker } from "../../media-picker";
import { PhotoGrid } from "./photo-list-grid";
import { PhotoListControls } from "./photo-list-controls";
import { usePhotoListUpload } from "./photo-list-upload";

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
  const [urls, setUrls] = useState<string[]>(defaultValue);
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

  const { fileRef, busy, progress, errors, handleFiles } = usePhotoListUpload(
    folder,
    max,
    urls.length,
    add,
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">{label}</legend>

      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      <PhotoGrid
        urls={urls}
        move={move}
        remove={(url) => setUrls((current) => current.filter((u) => u !== url))}
      />

      <PhotoListControls
        inputId={inputId}
        fileRef={fileRef}
        busy={busy}
        full={urls.length >= max}
        max={max}
        progress={progress}
        errors={errors}
        onFiles={(files) => void handleFiles(files)}
        onOpenPicker={() => setPickerOpen(true)}
      />

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