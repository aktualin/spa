"use client";

import { useRef, useState } from "react";

/**
 * Editor rich text ringan untuk form admin (bold/italic/heading/list/link/
 * gambar inline). Hasil HTML dikirim lewat hidden input `name`; Server Action
 * WAJIB menjalankan `sanitizeHtml()` sebelum menyimpan.
 *
 * Sengaja tanpa dependency: `contentEditable` + `execCommand` cukup untuk
 * kebutuhan artikel journal dan blok konten halaman.
 */
export function RichTextField({
  name,
  label,
  defaultValue = "",
  folder = "content",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  /** Folder upload untuk gambar inline. */
  folder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sync() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    const url = window.prompt("URL tautan (https://…)");
    if (url) run("createLink", url);
  }

  async function addImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengunggah gambar.");
        return;
      }
      run("insertImage", data.url);
    } catch {
      setError("Gagal menghubungi server saat mengunggah.");
    } finally {
      setBusy(false);
    }
  }

  const tool =
    "rounded px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-50";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <input type="hidden" name={name} value={html} />

      <div className="rounded-md border border-neutral-300 focus-within:border-neutral-900">
        <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-1">
          <button type="button" className={`${tool} font-bold`} onClick={() => run("bold")}>
            B
          </button>
          <button type="button" className={`${tool} italic`} onClick={() => run("italic")}>
            I
          </button>
          <button type="button" className={tool} onClick={() => run("formatBlock", "H2")}>
            H2
          </button>
          <button type="button" className={tool} onClick={() => run("formatBlock", "H3")}>
            H3
          </button>
          <button type="button" className={tool} onClick={() => run("formatBlock", "P")}>
            Paragraf
          </button>
          <button type="button" className={tool} onClick={() => run("insertUnorderedList")}>
            • List
          </button>
          <button type="button" className={tool} onClick={() => run("insertOrderedList")}>
            1. List
          </button>
          <button type="button" className={tool} onClick={addLink}>
            Link
          </button>
          <label className={`${tool} cursor-pointer`}>
            {busy ? "Mengunggah…" : "Gambar"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void addImage(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          className="prose prose-sm min-h-48 max-w-none px-3 py-2 text-sm outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: defaultValue }}
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
