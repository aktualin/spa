import Link from "next/link";

import { listPageSeo } from "../actions/seo";
import { Badge, StatusBanner } from "../settings/_components/form-ui";
import { SUGGESTED_SEO_PATHS } from "./suggested-paths";

export const instant = false;

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [entries, params] = await Promise.all([listPageSeo(), searchParams]);

  const existingPaths = new Set(entries.map((entry) => entry.path));
  const missingPaths = SUGGESTED_SEO_PATHS.filter(
    (path) => !existingPaths.has(path),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">SEO Halaman</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {entries.length} entri meta title &amp; description per halaman statis.
          </p>
        </div>
        <Link
          href="/admin/seo/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah entri
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Entri SEO dihapus."
      />

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada entri SEO. Pilih salah satu path yang disarankan di bawah
          untuk mulai.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/seo/${entry.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {entry.path}
                </Link>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {entry.title ?? "Tanpa title"} · {entry.description ?? "Tanpa description"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {entry.title && entry.title.length > 60 ? (
                  <Badge tone="warn">Title panjang</Badge>
                ) : null}
                {entry.description && entry.description.length > 160 ? (
                  <Badge tone="warn">Desc panjang</Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {missingPaths.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Path yang disarankan
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Klik untuk membuat entri SEO baru pada path tersebut.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {missingPaths.map((path) => (
              <li key={path}>
                <Link
                  href={`/admin/seo/new?path=${encodeURIComponent(path)}`}
                  className="inline-block rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
                >
                  + {path}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
