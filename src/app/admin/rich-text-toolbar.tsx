"use client";

import type { RefObject } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";
import type { ImagePlacement } from "@/lib/domain/rich-text-layout";

const tool =
  "rounded px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40";

/** Toolbar editor visual: format teks, tautan, gambar, posisi gambar, undo/redo. */
export function RichTextToolbar({
  run,
  busy,
  fileRef,
  onFile,
  onOpenPicker,
  onImagePlacement,
}: {
  run: (command: string, value?: string) => void;
  busy: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onOpenPicker: () => void;
  onImagePlacement: (placement: ImagePlacement) => void;
}) {
  function addLink() {
    const url = window.prompt("Link URL (https://…, mailto:…, or /page)");
    if (!url) return;
    run("createLink", url.trim());
  }

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1">
      <button type="button" title="Large heading" className={tool} onClick={() => run("formatBlock", "H2")}>H2</button>
      <button type="button" title="Subheading" className={tool} onClick={() => run("formatBlock", "H3")}>H3</button>
      <button type="button" title="Small heading" className={tool} onClick={() => run("formatBlock", "H4")}>H4</button>
      <button type="button" title="Paragraph" className={tool} onClick={() => run("formatBlock", "P")}>¶</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Bold" className={`${tool} font-bold`} onClick={() => run("bold")}>B</button>
      <button type="button" title="Italic" className={`${tool} italic`} onClick={() => run("italic")}>I</button>
      <button type="button" title="Underline" className={`${tool} underline`} onClick={() => run("underline")}>U</button>
      <button type="button" title="Strikethrough" className={`${tool} line-through`} onClick={() => run("strikeThrough")}>S</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Bulleted list" className={tool} onClick={() => run("insertUnorderedList")}>• List</button>
      <button type="button" title="Numbered list" className={tool} onClick={() => run("insertOrderedList")}>1. List</button>
      <button type="button" title="Quote" className={tool} onClick={() => run("formatBlock", "BLOCKQUOTE")}>❝ Quote</button>
      <button type="button" title="Divider" className={tool} onClick={() => run("insertHorizontalRule")}>―</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Link" className={tool} onClick={addLink}>Link</button>
      <button type="button" title="Remove link" className={tool} onClick={() => run("unlink")}>Unlink</button>
      <label className={`${tool} cursor-pointer font-normal`} title="Upload image">
        {busy ? "Uploading…" : "Image"}
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
      <button type="button" title="Select an image from the Media Library" className={tool} disabled={busy} onClick={onOpenPicker}>
        Media Library
      </button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Image on the left, text flows on the right" className={tool} onClick={() => onImagePlacement("left")}>◧ Left</button>
      <button type="button" title="Image on the right, text flows on the left" className={tool} onClick={() => onImagePlacement("right")}>◨ Right</button>
      <button type="button" title="Image centered" className={tool} onClick={() => onImagePlacement("center")}>Center</button>
      <button type="button" title="Full-width image, text above/below" className={tool} onClick={() => onImagePlacement("block")}>Block</button>
      <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
      <button type="button" title="Clear formatting" className={tool} onClick={() => run("removeFormat")}>Tx</button>
      <button type="button" title="Undo" className={tool} onClick={() => run("undo")}>Undo</button>
      <button type="button" title="Redo" className={tool} onClick={() => run("redo")}>Redo</button>
    </div>
  );
}