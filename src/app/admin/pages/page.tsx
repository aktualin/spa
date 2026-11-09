import Link from "next/link";

import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";

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
        subtitle={`${PUBLIC_STATIC_ROUTES.length} halaman bawaan + ${pages.length} halaman bebas.`}
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

      <h2 className="mt-10 text-base font-semibold text-neutral-900">
        Halaman bawaan situs
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Halaman ini punya tata letak sendiri, jadi alamat dan tata letaknya tetap
        — tapi seluruh isinya tetap berasal dari admin. Kolom{" "}
        <strong>Isi diatur di</strong> menunjuk modul pengisinya, dan{" "}
        <strong>SEO</strong> membuka meta title, description, serta OG image
        halaman itu.
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Halaman</th>
              <th className="px-4 py-2 font-medium">URL</th>
              <th className="px-4 py-2 font-medium">Isi diatur di</th>
              <th className="px-4 py-2 font-medium">SEO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {PUBLIC_STATIC_ROUTES.map((route) => (
              <tr key={route.path}>
                <td className="px-4 py-3 font-medium text-neutral-900">{route.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-600">{route.path}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-x-2 gap-y-1">
                    {route.contentModules.map((mod) => (
                      <Link
                        key={mod.href}
                        href={mod.href}
                        className="text-neutral-700 underline-offset-2 hover:underline"
                      >
                        {mod.label}
                      </Link>
                    ))}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href="/admin/seo"
                    className="text-neutral-700 underline-offset-2 hover:underline"
                  >
                    Atur SEO
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
