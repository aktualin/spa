import Link from "next/link";

import { deleteRedirectAction, listRedirects } from "../actions/redirects";
import { Badge, PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";
import { ConfirmSubmit } from "../settings/_components/form-ui";
import { RedirectForm } from "./redirect-form";

export const instant = false;

export default async function AdminRedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [redirects, params] = await Promise.all([listRedirects(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/pages" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Halaman & URL
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Redirect 301"
          subtitle={`${redirects.length} redirect aktif.`}
        />
      </div>

      <p className="mt-3 text-sm text-neutral-600">
        Redirect mengalihkan pengunjung (dan Google) dari alamat lama ke alamat baru.
        Redirect <strong>otomatis</strong> dibuat sistem saat slug halaman yang
        pernah terbit diubah. Tambahkan redirect <strong>manual</strong> bila sebuah
        alamat lama sudah tidak dipakai, misalnya setelah halaman dihapus. Pakai 301
        untuk pindah permanen dan 302 untuk pengalihan sementara.
      </p>

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Redirect dihapus."
      />

      <div className="mt-6">
        <RedirectForm />
      </div>

      <div className="mt-6">
        {redirects.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada redirect.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {redirects.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm text-neutral-900">
                    {r.fromPath} <span className="text-neutral-400">→</span> {r.toPath}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <Badge tone={r.statusCode === 301 ? "default" : "amber"}>
                      {r.statusCode}
                    </Badge>
                    <Badge tone={r.source === "auto" ? "blue" : "muted"}>
                      {r.source === "auto" ? "Otomatis" : "Manual"}
                    </Badge>
                    <span>{formatWibDate(r.createdAt)}</span>
                    {r.note ? <span className="break-words">· {r.note}</span> : null}
                  </div>
                </div>
                <form action={deleteRedirectAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit
                    message={`Hapus redirect ${r.fromPath} → ${r.toPath}? Pengunjung alamat lama akan melihat "halaman tidak ditemukan".`}
                  >
                    Hapus
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
