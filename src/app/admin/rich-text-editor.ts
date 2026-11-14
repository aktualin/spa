"use client";

import { useEffect, useRef, useState } from "react";

import { formatHtmlForEditing, toSafeHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";

export type Mode = "visual" | "html" | "preview";

/**
 * State & perintah editor contentEditable: sinkronisasi isi, execCommand,
 * sisip gambar, dan perpindahan mode (visual/HTML/pratinjau).
 *
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
export function useRichTextEditor(defaultValue: string) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Teks polos lama ditampilkan sebagai paragraf agar langsung bisa diformat.
  const [html, setHtml] = useState(() => toSafeHtml(defaultValue));
  const [mode, setMode] = useState<Mode>("visual");

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

  function insertImage(url: string, alt = "") {
    const safeAlt = alt.replace(/"/g, "&quot;");
    insertHtml(`<img src="${url}" alt="${safeAlt}" loading="lazy">`);
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

  return { editorRef, html, setHtml, mode, setMode, sync, run, insertHtml, insertImage, switchMode };
}