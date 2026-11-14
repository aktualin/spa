import Link from "next/link";

import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";

import { listPages } from "../actions/pages";
import { PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";
import { StaticRoutesTable } from "./pages-static-table";
import { PagesTable } from "./pages-table";

export const instant = false;

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
        <PagesTable pages={pages} />
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

      <StaticRoutesTable />
    </div>
  );
}