"use client";

import { useState } from "react";

import { MediaPicker } from "./media-picker";
import { useRichTextEditor } from "./rich-text-editor";
import { ModeTabs, VisualEditor } from "./rich-text-modes";
import { HtmlEditor, PreviewPane } from "./rich-text-panes";
import { RichTextToolbar } from "./rich-text-toolbar";
import { useInlineImageUpload } from "./image-upload";

/**
 * Editor konten berformat untuk form admin (visual/HTML/pratinjau).
 * Penjelasan lengkap mode & sanitasi ada di ./rich-text-editor.
 */
export function RichTextField({
  name,
  label,
  defaultValue = "",
  folder = "content",
  hint,
  compact = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  /** Folder upload untuk gambar inline. */
  folder?: string;
  hint?: string;
  /** Tinggi awal lebih pendek untuk deskripsi singkat. */
  compact?: boolean;
}) {
  const editor = useRichTextEditor(defaultValue);
  const { editorRef, html, setHtml, mode, setMode, sync, run, insertHtml, insertImage, switchMode } = editor;
  const { fileRef, busy, error, uploadImage } = useInlineImageUpload(folder, insertImage);
  const [pickerOpen, setPickerOpen] = useState(false);

  const minHeight = compact ? "min-h-28" : "min-h-56";
  const surface = `kama-prose ${minHeight} max-w-none px-3 py-2 text-sm text-neutral-800 outline-none`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="block text-sm font-medium text-neutral-700">{label}</span>
        <ModeTabs mode={mode} label={label} switchMode={switchMode} />
      </div>

      <input type="hidden" name={name} value={html} />

      <div className="overflow-hidden rounded-md border border-neutral-300 focus-within:border-neutral-900">
        {mode === "visual" ? (
          <>
            <RichTextToolbar
              run={run}
              busy={busy}
              fileRef={fileRef}
              onFile={(file) => void uploadImage(file)}
              onOpenPicker={() => setPickerOpen(true)}
            />
            <VisualEditor
              editorRef={editorRef}
              label={label}
              surface={surface}
              sync={sync}
              insertHtml={insertHtml}
            />
          </>
        ) : null}

        {mode === "html" ? (
          <HtmlEditor html={html} setHtml={setHtml} label={label} minHeight={minHeight} compact={compact} />
        ) : null}

        {mode === "preview" ? (
          <PreviewPane html={html} surface={surface} minHeight={minHeight} />
        ) : null}
      </div>

      <p className="text-xs text-neutral-500">
        {hint ??
          "Format teks lewat toolbar, atau pindah ke tab HTML untuk menulis/menempel HTML. Script, iframe, dan atribut berbahaya otomatis dibuang."}
      </p>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setPickerOpen(false);
          setMode("visual");
          // Tunggu editor visual terpasang lagi sebelum menyisipkan.
          requestAnimationFrame(() => insertImage(asset.url));
        }}
      />
    </div>
  );
}