#!/usr/bin/env node
/**
 * Menggabungkan panduan admin (docs/user-guide/*.md) menjadi SATU berkas HTML
 * siap cetak: docs/user-guide/panduan-admin.html.
 *
 *   node scripts/build-user-guide.mjs
 *
 * - Urutan bab = urutan tautan `*.md` di daftar isi docs/user-guide/README.md.
 * - README.md sendiri menjadi bab "Pendahuluan" (sampai penanda
 *   `<!-- akhir-pendahuluan -->`).
 * - Konversi Markdown dasar ditulis sendiri (tanpa dependensi): heading,
 *   paragraf, list bertingkat, tabel, blok kode, kode inline, tebal/miring,
 *   tautan, garis horizontal.
 * - PDF dibuat lewat peramban: buka HTML → Print → Save as PDF (A4).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDE_DIR = join(ROOT, "docs", "user-guide");
const INDEX_FILE = join(GUIDE_DIR, "README.md");
const OUT_FILE = join(GUIDE_DIR, "panduan-admin.html");
const INTRO_END = "<!-- akhir-pendahuluan -->";

// ---------------------------------------------------------------------------
// Utilitas
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/['’‘“”"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function chapterId(file) {
  return `bab-${file.replace(/\.md$/, "")}`;
}

/** Hilangkan format Markdown inline — untuk teks daftar isi & id heading. */
function plainText(md) {
  return md
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

// ---------------------------------------------------------------------------
// Inline Markdown
// ---------------------------------------------------------------------------

/** Bab yang sedang dirender — untuk tautan "#bagian" di dalam bab yang sama. */
let currentChapter = "README.md";

function resolveHref(href) {
  const match = /^([a-z0-9-]+)\.md(?:#(.*))?$/i.exec(href);
  if (match) {
    const id = chapterId(`${match[1]}.md`);
    return match[2] ? `#${id}-${slugify(match[2])}` : `#${id}`;
  }
  if (href.startsWith("#")) return `#${chapterId(currentChapter)}-${slugify(href.slice(1))}`;
  return href;
}

function renderInline(md) {
  const codes = [];
  // 1. Simpan kode inline lebih dulu supaya isinya tidak ikut diformat.
  let text = md.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  // 2. Komentar HTML dibuang, sisa teks di-escape.
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = escapeHtml(text);
  // 3. Tautan [teks](url).
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const target = resolveHref(href.replace(/&amp;/g, "&"));
    const external = /^https?:\/\//.test(target);
    return `<a href="${escapeHtml(target)}"${external ? ' rel="noopener"' : ""}>${label}</a>`;
  });
  // 4. Tebal lalu miring.
  text = text.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+?)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*\w])\*([^*\s](?:[^*]*?[^*\s])?)\*(?!\w)/g, "$1<em>$2</em>");
  text = text.replace(/(^|[\s(])_([^_\s](?:[^_]*?[^_\s])?)_(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
  // 5. Kembalikan kode inline.
  return text.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

// ---------------------------------------------------------------------------
// Blok Markdown
// ---------------------------------------------------------------------------

function splitRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|") && !row.endsWith("\\|")) row = row.slice(0, -1);
  // Pisahkan per "|" yang tidak di-escape dan tidak di dalam kode inline.
  const cells = [];
  let current = "";
  let inCode = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === "`") inCode = !inCode;
    if (ch === "\\" && row[i + 1] === "|") {
      current += "|";
      i++;
      continue;
    }
    if (ch === "|" && !inCode) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);
const listMatch = (line) => /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
const indentOf = (line) => line.match(/^\s*/)[0].replace(/\t/g, "    ").length;

/**
 * Mengubah satu bab Markdown menjadi HTML.
 * `onHeading(level, text)` dipanggil untuk setiap heading dan mengembalikan id.
 */
function renderMarkdown(md, onHeading) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let paragraph = [];
  /** Tumpukan list terbuka: { type: "ul"|"ol", indent, liOpen } */
  const lists = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const html = `<p>${renderInline(paragraph.join(" "))}</p>`;
    paragraph = [];
    out.push(html);
  };
  const closeLists = (toIndent = -1) => {
    while (lists.length && lists[lists.length - 1].indent > toIndent) {
      const top = lists.pop();
      out.push(`</li></${top.type}>`);
    }
  };
  const closeAll = () => {
    flushParagraph();
    closeLists(-1);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blok kode berpagar.
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const fenceIndent = indentOf(line);
      if (!(lists.length && fenceIndent > lists[lists.length - 1].indent)) closeLists(-1);
      const lang = trimmed.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        body.push(lines[i].slice(Math.min(fenceIndent, indentOf(lines[i]))));
        i++;
      }
      const cls = lang ? ` class="lang-${escapeHtml(lang)}"` : "";
      out.push(`<pre><code${cls}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // Baris kosong: akhiri paragraf (list tetap terbuka bila berlanjut).
    if (trimmed === "") {
      flushParagraph();
      const next = lines.slice(i + 1).find((l) => l.trim() !== "");
      if (lists.length && (!next || (!listMatch(next) && indentOf(next) <= lists[0].indent))) {
        closeLists(-1);
      }
      continue;
    }

    // Komentar HTML satu baris.
    if (/^<!--.*-->$/.test(trimmed)) continue;

    // Heading.
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(trimmed);
    if (heading && indentOf(line) < 4) {
      closeAll();
      const level = heading[1].length;
      const id = onHeading(level, heading[2]);
      out.push(`<h${level} id="${id}">${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    // Garis horizontal.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeAll();
      out.push("<hr>");
      continue;
    }

    // Tabel.
    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      closeAll();
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) =>
        c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : "",
      );
      const cell = (tag, text, idx) =>
        `<${tag}${align[idx] ? ` style="text-align:${align[idx]}"` : ""}>${renderInline(text)}</${tag}>`;
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--;
      out.push(
        `<table><thead><tr>${head.map((c, idx) => cell("th", c, idx)).join("")}</tr></thead>` +
          `<tbody>${rows
            .map((r) => `<tr>${head.map((_, idx) => cell("td", r[idx] ?? "", idx)).join("")}</tr>`)
            .join("")}</tbody></table>`,
      );
      continue;
    }

    // Kutipan.
    if (trimmed.startsWith(">")) {
      closeAll();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      i--;
      out.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    // Item list.
    const item = listMatch(line);
    if (item) {
      flushParagraph();
      const indent = indentOf(line);
      const type = /\d/.test(item[2]) ? "ol" : "ul";
      closeLists(indent);
      const top = lists[lists.length - 1];
      if (top && top.indent === indent) {
        if (top.type !== type) {
          lists.pop();
          out.push(`</li></${top.type}>`);
          const start = type === "ol" ? parseInt(item[2], 10) : 1;
          out.push(type === "ol" && start !== 1 ? `<ol start="${start}"><li>` : `<${type}><li>`);
          lists.push({ type, indent });
        } else {
          out.push("</li><li>");
        }
      } else {
        const start = type === "ol" ? parseInt(item[2], 10) : 1;
        out.push(type === "ol" && start !== 1 ? `<ol start="${start}"><li>` : `<${type}><li>`);
        lists.push({ type, indent });
      }
      paragraph.push(item[3]);
      // Gabungkan baris lanjutan (menjorok, bukan item/blok baru).
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() !== "" &&
        !listMatch(lines[i + 1]) &&
        !lines[i + 1].trim().startsWith("```") &&
        !lines[i + 1].trim().startsWith("|") &&
        indentOf(lines[i + 1]) > indent
      ) {
        paragraph.push(lines[++i].trim());
      }
      out.push(renderInline(paragraph.join(" ")));
      paragraph = [];
      continue;
    }

    // Paragraf di dalam item list (menjorok setelah baris kosong).
    if (lists.length && indentOf(line) > lists[lists.length - 1].indent) {
      const para = [trimmed];
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() !== "" &&
        !listMatch(lines[i + 1]) &&
        !lines[i + 1].trim().startsWith("```")
      ) {
        para.push(lines[++i].trim());
      }
      out.push(`<p>${renderInline(para.join(" "))}</p>`);
      continue;
    }

    closeLists(-1);
    paragraph.push(trimmed);
  }
  closeAll();
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Susun bab
// ---------------------------------------------------------------------------

if (!existsSync(INDEX_FILE)) {
  console.error(`✖ Tidak menemukan ${INDEX_FILE}`);
  process.exit(1);
}

const readme = readFileSync(INDEX_FILE, "utf8");
const markerAt = readme.indexOf(INTRO_END);
const intro = markerAt >= 0 ? readme.slice(0, markerAt) : readme;

const order = [];
for (const match of intro.matchAll(/\]\(([a-z0-9-]+\.md)\)/gi)) {
  const file = match[1];
  if (file.toLowerCase() !== "readme.md" && !order.includes(file)) order.push(file);
}

const missing = order.filter((file) => !existsSync(join(GUIDE_DIR, file)));
if (missing.length) {
  console.error(`✖ Bab di daftar isi tidak ditemukan: ${missing.join(", ")}`);
  process.exit(1);
}
const unlisted = readdirSync(GUIDE_DIR).filter(
  (f) => f.endsWith(".md") && f !== "README.md" && !order.includes(f),
);
if (unlisted.length) {
  console.warn(`⚠ Berkas tidak tercantum di daftar isi (tidak ikut dicetak): ${unlisted.join(", ")}`);
}

const toc = [];
const chapters = [];

function buildChapter(file, md, number) {
  currentChapter = file;
  const id = chapterId(file);
  const used = new Set();
  let entry = null;
  const html = renderMarkdown(md, (level, text) => {
    if (level === 1) {
      const title = plainText(text);
      entry = { id, title: number ? `Bab ${number}. ${title}` : title, children: [] };
      return id;
    }
    let hid = `${id}-${slugify(plainText(text)) || "bagian"}`;
    while (used.has(hid)) hid += "-1";
    used.add(hid);
    if (level === 2 && entry) entry.children.push({ id: hid, title: plainText(text) });
    return hid;
  });
  if (!entry) entry = { id, title: number ? `Bab ${number}` : file, children: [] };
  toc.push(entry);
  // Ganti H1 bab agar memuat nomor bab.
  const titled = html.replace(
    new RegExp(`<h1 id="${id}">[\\s\\S]*?</h1>`),
    `<h1 id="${id}" class="chapter-title">${escapeHtml(entry.title)}</h1>`,
  );
  chapters.push(`<section class="chapter">\n${titled}\n</section>`);
}

buildChapter("README.md", intro.replace(/^#\s+.*$/m, "# Pendahuluan"), 0);
order.forEach((file, idx) => {
  buildChapter(file, readFileSync(join(GUIDE_DIR, file), "utf8"), idx + 1);
});

const generatedAt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
}).format(new Date());

const tocHtml = toc
  .map(
    (c) =>
      `<li><a href="#${c.id}">${escapeHtml(c.title)}</a>${
        c.children.length
          ? `<ul>${c.children.map((s) => `<li><a href="#${s.id}">${escapeHtml(s.title)}</a></li>`).join("")}</ul>`
          : ""
      }</li>`,
  )
  .join("\n");

const css = `
@page { size: A4; margin: 18mm 16mm 20mm; @bottom-center { content: counter(page); font-size: 9pt; color: #777; } }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0 auto; max-width: 820px; padding: 24px; font: 11pt/1.55 "Segoe UI", "Helvetica Neue", Arial, sans-serif; color: #222; background: #fff; }
h1, h2, h3, h4 { color: #3b2f2a; line-height: 1.25; break-after: avoid; page-break-after: avoid; }
h1 { font-size: 22pt; margin: 0 0 14px; padding-bottom: 6px; border-bottom: 2px solid #b08d57; }
h2 { font-size: 15pt; margin: 22px 0 8px; }
h3 { font-size: 12.5pt; margin: 18px 0 6px; }
h4 { font-size: 11pt; margin: 14px 0 4px; }
p { margin: 0 0 9px; }
a { color: #7a5a2b; text-decoration: none; }
code { font-family: "SFMono-Regular", Consolas, Menlo, monospace; font-size: 9.5pt; background: #f4efe8; padding: 1px 4px; border-radius: 3px; word-break: break-word; }
pre { background: #f4efe8; padding: 10px 12px; border-radius: 4px; overflow-x: auto; break-inside: avoid; }
pre code { background: none; padding: 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 9.5pt; }
th, td { border: 1px solid #d8cfc4; padding: 5px 7px; vertical-align: top; text-align: left; }
th { background: #efe7dc; }
tr { break-inside: avoid; page-break-inside: avoid; }
ul, ol { margin: 0 0 10px; padding-left: 22px; }
li { margin: 2px 0; }
blockquote { margin: 8px 0; padding: 6px 12px; border-left: 3px solid #b08d57; background: #faf6f0; }
hr { border: 0; border-top: 1px solid #d8cfc4; margin: 18px 0; }
.cover { min-height: 92vh; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.cover h1 { border: 0; font-size: 30pt; margin-bottom: 8px; }
.cover .sub { font-size: 14pt; color: #6b5a4e; }
.cover .meta { margin-top: 40px; font-size: 10pt; color: #777; }
.toc ul { list-style: none; padding-left: 0; }
.toc > ul > li { margin: 6px 0; font-weight: 600; }
.toc ul ul { padding-left: 18px; font-weight: 400; font-size: 9.5pt; columns: 2; }
.chapter, .toc { break-before: page; page-break-before: always; }
@media screen { body { box-shadow: 0 0 0 1px #eee; } .chapter, .toc { margin-top: 48px; } }
@media print { body { max-width: none; padding: 0; } a { color: inherit; } }
`;

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panduan Admin KAMA Spa</title>
<style>${css}</style>
</head>
<body>
<section class="cover">
  <h1>Panduan Pengguna Dashboard Admin</h1>
  <p class="sub">KAMA Spa — kamaspa.id</p>
  <p class="meta">Kontrak 01/PKS/XI/KAMA/2026 · Dokumentasi serah terima<br>Dibuat ${escapeHtml(generatedAt)}</p>
</section>
<nav class="toc">
  <h1 id="daftar-isi">Daftar Isi</h1>
  <ul>
${tocHtml}
  </ul>
</nav>
${chapters.join("\n")}
</body>
</html>
`;

writeFileSync(OUT_FILE, html);
console.log(`✔ ${order.length} bab + pendahuluan → ${OUT_FILE.replace(`${ROOT}/`, "")} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
