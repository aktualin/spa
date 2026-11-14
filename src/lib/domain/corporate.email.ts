/** Email notifikasi inquiry corporate — lihat `corporate.ts`. */
import { collapseControlChars } from "./text.ts";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Satu baris tanpa karakter kontrol (untuk subjek email). */
function singleLine(value: string, max = 80): string {
  const line = collapseControlChars(value);
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

export type InquiryEmailInput = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  /** Tautan ke detail inquiry di dashboard admin. */
  adminUrl: string;
};

export function buildInquiryEmail(input: InquiryEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const who = input.company ? `${input.name} (${input.company})` : input.name;
  const subject = `Inquiry Corporate Wellness baru — ${singleLine(who)}`;

  const rows: [string, string][] = [
    ["Nama", input.name],
    ...(input.company ? ([["Perusahaan", input.company]] as [string, string][]) : []),
    ["Email", input.email],
    ...(input.phone ? ([["Telepon", input.phone]] as [string, string][]) : []),
  ];

  const text = [
    "Inquiry Corporate Wellness baru dari situs KAMA Spa.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Pesan:",
    input.message,
    "",
    `Kelola di dashboard: ${input.adminUrl}`,
    "",
    "Email ini memuat data pribadi (UU PDP). Jangan diteruskan ke luar tim.",
  ].join("\n");

  const html = [
    "<p><strong>Inquiry Corporate Wellness baru</strong> dari situs KAMA Spa.</p>",
    "<table cellpadding=\"4\" style=\"border-collapse:collapse\">",
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#666">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    "<p><strong>Pesan:</strong></p>",
    `<p>${escapeHtml(input.message).replace(/\r?\n/g, "<br />")}</p>`,
    `<p><a href="${escapeHtml(input.adminUrl)}">Buka di dashboard admin</a></p>`,
    "<p style=\"color:#888;font-size:12px\">Email ini memuat data pribadi (UU PDP). Jangan diteruskan ke luar tim.</p>",
  ].join("");

  return { subject, text, html };
}