import Link from "next/link";

/** Keterangan asal konten section non-banner (tanpa form isian). */
export function SectionSourceNote({
  source,
}: {
  source: { text: string; link?: { href: string; label: string } };
}) {
  return (
    <div className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
      <p>{source.text}</p>
      {source.link ? (
        <Link
          href={source.link.href}
          className="mt-1 inline-block font-medium text-neutral-900 underline underline-offset-2"
        >
          {source.link.label} →
        </Link>
      ) : null}
    </div>
  );
}