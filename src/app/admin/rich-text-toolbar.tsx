"use client";

import type { RefObject } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

const tool =
  "rounded px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40";

/** Toolbar editor visual: format teks, tautan, gambar, dan undo/redo. */
export function RichTextToolbar({
  run,
  busy,
  fileRef,
  onFile,
  onOpenPicker,
}: {
  run: (command: string, value?: string) => void;
  busy: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onOpenPicker: () => void;
}) {
  function addLink() {
    const url = window.prompt("URL tautan (https://…, mailto:…, atau /halaman)");
    if (!url) return;
    run("createLink", url.trim());
  }

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1">
      <button type="button" title="Judul besar" className={tool} onClick={() => run("formatBlock", "H2")}>H2</button>
      <button type="button" title="Sub judul" className={tool} onClick={() => run("formatBlock", "H3")}>H3</button>
      <button type="button" title="Judul kecil" className={tool} onClick={() => run("formatBlock", "H4")}>H4</button>
      <button type="button" title="Paragraf" className={tool} onClick={() => run("formatBlock", "P")}>¶</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Tebal" className={`${tool} font-bold`} onClick={() => run("bold")}>B</button>
      <button type="button" title="Miring" className={`${tool} italic`} onClick={() => run("italic")}>I</button>
      <button type="button" title="Garis bawah" className={`${tool} underline`} onClick={() => run("underline")}>U</button>
      <button type="button" title="Coret" className={`${tool} line-through`} onClick={() => run("strikeThrough")}>S</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Daftar berpoin" className={tool} onClick={() => run("insertUnorderedList")}>• List</button>
      <button type="button" title="Daftar bernomor" className={tool} onClick={() => run("insertOrderedList")}>1. List</button>
      <button type="button" title="Kutipan" className={tool} onClick={() => run("formatBlock", "BLOCKQUOTE")}>❝ Kutip</button>
      <button type="button" title="Garis pemisah" className={tool} onClick={() => run("insertHorizontalRule")}>―</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Tautan" className={tool} onClick={addLink}>Link</button>
      <button type="button" title="Hapus tautan" className={tool} onClick={() => run("unlink")}>Unlink</button>
      <label className={`${tool} cursor-pointer font-normal`} title="Unggah gambar">
        {busy ? "Mengunggah…" : "Gambar"}
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
      <button type="button" title="Pilih gambar dari Media Library" className={tool} disabled={busy} onClick={onOpenPicker}>
        Media Library
      </button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Hapus format" className={tool} onClick={() => run("removeFormat")}>Tx</button>
      <button type="button" title="Urungkan" className={tool} onClick={() => run("undo")}>Undo</button>
      <button type="button" title="Ulangi" className={tool} onClick={() => run("redo")}>Redo</button>
    </div>
  );
}