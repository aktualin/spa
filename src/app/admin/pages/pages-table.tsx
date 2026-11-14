import Link from "next/link";

import type { listPages } from "../actions/pages";
import { Badge } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";

const TEMPLATE_LABEL = { STANDARD: "Standar", LEGAL: "Dokumen legal" } as const;

type PageRow = Awaited<ReturnType<typeof listPages>>[number];

/** Tabel halaman bebas (judul, URL, template, status, diubah). */
export function PagesTable({ pages }: { pages: PageRow[] }) {
  if (pages.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Belum ada halaman. Tekan <strong>Tambah halaman</strong> untuk membuat
        yang pertama.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-medium">Judul</th>
            <th className="px-4 py-2 font-medium">URL</th>
            <th className="px-4 py-2 font-medium">Template</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Diubah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {pages.map((page) => (
            <tr key={page.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {page.title}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                /{page.slug}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {TEMPLATE_LABEL[page.template]}
              </td>
              <td className="px-4 py-3">
                {page.status === "PUBLISHED" ? (
                  <Badge tone="green">Terbit</Badge>
                ) : (
                  <Badge tone="muted">Draf</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {formatWibDateTime(page.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}