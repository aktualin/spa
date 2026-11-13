"use client";

import { useEffect, useRef, useState } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";
import { formatHtmlForEditing, toSafeHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { compressImageForUpload } from "@/lib/image-compress-client";

import { MediaPicker } from "./media-picker";

type Mode = "visual" | "html" | "preview";

/**
 * Editor konten berformat untuk form admin, dengan tiga mode:
 *
 * - **Visual** — toolbar (heading, bold, list, kutipan, tautan, gambar, garis,
 *   hapus format, undo/redo). Menempel dari Word/Google Docs/web
 *   mempertahankan format; HTML tempelan disanitasi lebih dulu.
 * - **HTML** — tulis atau tempel HTML mentah (tabel, figure, dll.).
 * - **Pratinjau** — tampilan persis seperti di website (sanitasi + gaya
 *   `.kama-prose` yang sama dengan halaman publik).
 *
 * Hasil HTML dikirim lewat hidden input `name`; Server Action tetap WAJIB
 * menjalankan `sanitizeHtml()` sebelum menyimpan. Teks polos lama (sebelum
 * editor dipakai) otomatis ditampilkan sebagai paragraf.
 *
 * Sengaja tanpa dependency: `contentEditable` + `execCommand` cukup untuk
 * kebutuhan konten situs ini.
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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Teks polos lama ditampilkan sebagai paragraf agar langsung bisa diformat.
  const [html, setHtml] = useState(() => toSafeHtml(defaultValue));
  const [mode, setMode] = useState<Mode>("visual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Isi editor visual hanya ditulis saat (kembali) masuk mode visual, supaya
  // posisi kursor tidak melompat setiap kali mengetik.
  useEffect(() => {
    if (mode === "visual" && editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [mode]);

  function sync() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function insertHtml(fragment: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, fragment);
    sync();
  }

  function addLink() {
    const url = window.prompt("URL tautan (https://…, mailto:…, atau /halaman)");
    if (!url) return;
    run("createLink", url.trim());
  }

  function insertImage(url: string, alt = "") {
    const safeAlt = alt.replace(/"/g, "&quot;");
    insertHtml(`<img src="${url}" alt="${safeAlt}" loading="lazy">`);
  }

  async function uploadImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", await compressImageForUpload(file));
      body.append("folder", folder);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengunggah gambar.");
        return;
      }
      insertImage(data.url);
    } catch {
      setError("Gagal menghubungi server saat mengunggah.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function switchMode(next: Mode) {
    if (mode === "visual") sync();
    // HTML mentah dirapikan saat keluar dari mode HTML agar editor visual
    // dan pratinjau menampilkan hal yang sama dengan website.
    if (mode === "html" && next !== "html") setHtml((value) => sanitizeHtml(value));
    // Masuk tab HTML: satu blok per baris supaya mudah dibaca dan disunting.
    if (next === "html" && mode !== "html") {
      setHtml((value) => formatHtmlForEditing(mode === "visual" ? (editorRef.current?.innerHTML ?? value) : value));
    }
    setMode(next);
  }

  const tool =
    "rounded px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40";
  const tab = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium ${
      active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
    } rounded`;
  const minHeight = compact ? "min-h-28" : "min-h-56";
  const surface = `kama-prose ${minHeight} max-w-none px-3 py-2 text-sm text-neutral-800 outline-none`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="block text-sm font-medium text-neutral-700">{label}</span>
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
      </div>

      <input type="hidden" name={name} value={html} />

      <div className="overflow-hidden rounded-md border border-neutral-300 focus-within:border-neutral-900">
        {mode === "visual" ? (
          <>
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
                    if (file) void uploadImage(file);
                  }}
                />
              </label>
              <button type="button" title="Pilih gambar dari Media Library" className={tool} disabled={busy} onClick={() => setPickerOpen(true)}>
                Media Library
              </button>
              <span className="mx-1 w-px bg-neutral-200" aria-hidden="true" />
              <button type="button" title="Hapus format" className={tool} onClick={() => run("removeFormat")}>Tx</button>
              <button type="button" title="Urungkan" className={tool} onClick={() => run("undo")}>Undo</button>
              <button type="button" title="Ulangi" className={tool} onClick={() => run("redo")}>Redo</button>
            </div>

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
          </>
        ) : null}

        {mode === "html" ? (
          <textarea
            aria-label={`${label} (HTML)`}
            value={html}
            spellCheck={false}
            onChange={(event) => setHtml(event.target.value)}
            className={`${minHeight} block w-full resize-y bg-neutral-950 px-3 py-2 font-mono text-xs leading-relaxed text-neutral-100 outline-none`}
            rows={compact ? 6 : 14}
            placeholder="<h2>Judul</h2>&#10;<p>Paragraf dengan <strong>teks tebal</strong> dan <a href=&quot;https://…&quot;>tautan</a>.</p>"
          />
        ) : null}

        {mode === "preview" ? (
          html.trim() ? (
            <div className={`${surface} bg-[#f6f1e9]`} dangerouslySetInnerHTML={{ __html: toSafeHtml(html) }} />
          ) : (
            <p className={`${minHeight} px-3 py-2 text-sm text-neutral-400`}>Belum ada isi.</p>
          )
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
