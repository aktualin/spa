import Link from "next/link";

/**
 * Navigasi halaman sederhana (sebelumnya/berikutnya) untuk inbox admin.
 * `hrefFor` membangun tautan per halaman agar filter (mis. status) ikut terjaga.
 */
export function ListPagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="text-neutral-700 hover:underline">
          ← Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <span className="text-neutral-500">
        Halaman {page} dari {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className="text-neutral-700 hover:underline">
          Berikutnya →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}