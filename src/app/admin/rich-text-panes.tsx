"use client";

import { toSafeHtml } from "@/lib/domain/rich-text";

/** Mode HTML: tulis/tempel markup mentah. */
export function HtmlEditor({
  html,
  setHtml,
  label,
  minHeight,
  compact,
}: {
  html: string;
  setHtml: (value: string) => void;
  label: string;
  minHeight: string;
  compact: boolean;
}) {
  return (
    <textarea
      aria-label={`${label} (HTML)`}
      value={html}
      spellCheck={false}
      onChange={(event) => setHtml(event.target.value)}
      className={`${minHeight} block w-full resize-y bg-neutral-950 px-3 py-2 font-mono text-xs leading-relaxed text-neutral-100 outline-none`}
      rows={compact ? 6 : 14}
      placeholder="<h2>Heading</h2>&#10;<p>Paragraph with <strong>bold text</strong> and a <a href=&quot;https://…&quot;>link</a>.</p>"
    />
  );
}

/** Mode pratinjau: tampilan persis seperti di website. */
export function PreviewPane({
  html,
  surface,
  minHeight,
}: {
  html: string;
  surface: string;
  minHeight: string;
}) {
  return html.trim() ? (
    <div className={`${surface} bg-[#f6f1e9]`} dangerouslySetInnerHTML={{ __html: toSafeHtml(html) }} />
  ) : (
    <p className={`${minHeight} px-3 py-2 text-sm text-neutral-400`}>No content yet.</p>
  );
}