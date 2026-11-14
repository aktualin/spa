import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listMedia, listMediaFolders, syncMediaAction } from "../actions/media";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { MediaFilterForm } from "./media-filter-form";
import { MediaGrid } from "./media-grid";
import { UploadPanel } from "./upload-panel";

export const instant = false;

type Search = {
  folder?: string;
  q?: string;
  unused?: string;
  saved?: string;
  deleted?: string;
  synced?: string;
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const folder = params.folder?.trim() || undefined;
  const q = params.q?.trim() || undefined;
  const unused = params.unused === "1";

  const [items, folders] = await Promise.all([
    listMedia({ folder, q, unused }),
    listMediaFolders(),
  ]);

  const query = new URLSearchParams();
  if (folder) query.set("folder", folder);
  if (q) query.set("q", q);
  if (unused) query.set("unused", "1");
  const back = query.size > 0 ? `/admin/media?${query}` : "/admin/media";
  const filtered = Boolean(folder || q || unused);
  // Urutan berlaku per folder; dengan pencarian/filter lain, tetangga yang
  // tertukar bisa jadi item yang sedang tersembunyi.
  const canReorder = Boolean(folder) && !q && !unused;
  const total = folders.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <PageHeader
          title="Media Library"
          subtitle={`${total} berkas di ${folders.length} folder. Semua gambar yang diunggah dari dashboard tercatat di sini.`}
          action={
            <form action={syncMediaAction}>
              <SmallSubmit title="Catat berkas lama yang sudah dipakai konten tetapi belum ada di Media Library">
                Sinkronkan berkas lama
              </SmallSubmit>
            </form>
          }
        />

        <StatusBanners saved={params.saved} deleted={params.deleted} deletedLabel="Berkas dihapus." />
        {params.synced !== undefined ? (
          <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
            Sinkronisasi selesai: {Number(params.synced) || 0} berkas lama baru dicatat.
          </p>
        ) : null}
      </div>

      <UploadPanel folders={folders.map((row) => row.folder)} />

      <MediaFilterForm folders={folders} folder={folder} q={q} unused={unused} filtered={filtered} />

      <MediaGrid items={items} canReorder={canReorder} back={back} filtered={filtered} />
    </div>
  );
}