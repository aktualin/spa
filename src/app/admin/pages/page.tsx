import Link from "next/link";

import { listPages } from "../actions/pages";
import { Badge, PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";

export const instant = false;

const TEMPLATE_LABEL = { STANDARD: "Standar", LEGAL: "Dokumen legal" } as const;

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; cleaned?: string }>;
}) {
  const [pages, params] = await Promise.all([listPages(), searchParams]);
  const cleaned = Number(params.cleaned ?? 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Halaman & URL"
        subtitle={`${pages.length} halaman terdaftar.`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/redirects"
              className="text-sm text-neutral-600 hover:underline"
            >
              Kelola redirect 301
            </Link>
            <Link href="/admin/pages/new" className={primaryLinkClass}>
              Tambah halaman
            </Link>
          </div>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel={
          cleaned > 0
            ? `Halaman dihapus. ${cleaned} redirect yang menuju halaman itu ikut dihapus.`
            : "Halaman dihapus."
        }
      />

      <div className="mt-6">
        {pages.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Belum ada halaman. Tekan <strong>Tambah halaman</strong> untuk membuat
            yang pertama.
          </p>
        ) : (
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
        )}
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Mengubah slug halaman yang pernah terbit otomatis membuat redirect 301 dari
        alamat lama, sehingga tautan lama dan peringkat Google tidak hilang.
      </p>
    </div>
  );
}
