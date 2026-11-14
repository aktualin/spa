"use client";

import type { RefObject } from "react";

import { sanitizeHtml } from "@/lib/domain/sanitize";

import type { Mode } from "./rich-text-editor";

const tab = (active: boolean) =>
  `px-3 py-1.5 text-xs font-medium ${
    active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
  } rounded`;

export function ModeTabs({
  mode,
  label,
  switchMode,
}: {
  mode: Mode;
  label: string;
  switchMode: (next: Mode) => void;
}) {
  return (
    <div role="tablist" aria-label={`Mode editor ${label}`} className="flex gap-1 rounded-md bg-neutral-100 p-0.5">
      <button type="button" role="tab" aria-selected={mode === "visual"} className={tab(mode === "visual")} onClick={() => switchMode("visual")}>
        Visual
      </button>
      <button type="button" role="tab" aria-selected={mode === "html"} className={tab(mode === "html")} onClick={() => switchMode("html")}>
        HTML
      </button>
      <button type="button" role="tab" aria-selected={mode === "preview"} className={tab(mode === "preview")} onClick={() => switchMode("preview")}>
        Pratinjau
      </button>
    </div>
  );
}

/** Permukaan contentEditable mode visual, termasuk sanitasi tempelan. */
export function VisualEditor({
  editorRef,
  label,
  surface,
  sync,
  insertHtml,
}: {
  editorRef: RefObject<HTMLDivElement | null>;
  label: string;
  surface: string;
  sync: () => void;
  insertHtml: (fragment: string) => void;
}) {
  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      aria-label={label}
      role="textbox"
      aria-multiline="true"
      onInput={sync}
      onBlur={sync}
      onPaste={(event) => {
        // Pertahankan format tempelan (Word/Docs/web), tapi buang
        // script, style, atribut on*, dan tag di luar daftar putih.
        const pasted = event.clipboardData.getData("text/html");
        if (!pasted) return;
        event.preventDefault();
        const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(pasted)?.[1] ?? pasted;
        insertHtml(sanitizeHtml(body.replace(/<style[\s\S]*?<\/style>/gi, "")));
      }}
      className={surface}
    />
  );
}

