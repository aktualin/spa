import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getMediaDetail } from "../../actions/media";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { AssetPreview, DeleteAssetSection, UsageList } from "../media-detail-parts";
import { MediaMetaForm, ReplaceFileForm } from "../media-forms";

export const instant = false;

export default async function AdminMediaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; blocked?: string; error?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getMediaDetail(id);
  if (!detail) notFound();

  const { asset, usages } = detail;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/media" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Media Library
      </Link>

      <h1 className="mt-3 break-all text-xl font-semibold text-neutral-900">
        {asset.title || asset.fileName}
      </h1>

      <StatusBanners saved={query.saved} />
      {query.blocked ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Berkas tidak bisa dihapus karena masih dipakai. Lepaskan dulu dari konten di daftar “Dipakai di”.
        </p>
      ) : null}
      {query.error === "storage" ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Gagal menghapus berkas dari penyimpanan. Coba lagi beberapa saat lagi.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AssetPreview asset={asset} />

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Informasi</h2>
            <MediaMetaForm
              id={asset.id}
              fileName={asset.fileName}
              title={asset.title ?? ""}
              altText={asset.altText ?? ""}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Dipakai di ({usages.length})
            </h2>
            <UsageList usages={usages} />
          </section>

          <section className="space-y-3">
            <ReplaceFileForm id={asset.id} folder={asset.folder} usageCount={usages.length} />
          </section>

          <DeleteAssetSection assetId={asset.id} usageCount={usages.length} />
        </div>
      </div>
    </div>
  );
}