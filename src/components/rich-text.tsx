import { toSafeHtml } from "@/lib/domain/rich-text";

/**
 * Render konten admin yang boleh berformat HTML (dari editor teks kaya) atau
 * teks polos lama. Selalu disanitasi di sini — pemanggil tidak perlu (dan
 * tidak boleh) memakai `dangerouslySetInnerHTML` sendiri untuk konten admin.
 * Gaya list/heading/tabel ada di `.kama-prose` (src/app/kama.css).
 */
export function RichText({
  value,
  className = "",
  as: Tag = "div",
}: {
  value: string | null | undefined;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  const html = toSafeHtml(value);
  if (!html) return null;
  return <Tag className={`kama-prose ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}
