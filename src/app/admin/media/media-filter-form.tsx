import Link from "next/link";

import { inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";

/** Form filter Media Library: folder, pencarian, dan hanya yang tidak dipakai. */
export function MediaFilterForm({
  folders,
  folder,
  q,
  unused,
  filtered,
}: {
  folders: { folder: string; count: number }[];
  folder?: string;
  q?: string;
  unused: boolean;
  filtered: boolean;
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="min-w-40 space-y-1.5">
        <label htmlFor="media-folder" className="block text-xs font-medium text-neutral-600">
          Folder
        </label>
        <select id="media-folder" name="folder" defaultValue={folder ?? ""} className={inputClass}>
          <option value="">Semua folder</option>
          {folders.map((row) => (
            <option key={row.folder} value={row.folder}>
              {row.folder} ({row.count})
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-48 flex-1 space-y-1.5">
        <label htmlFor="media-q" className="block text-xs font-medium text-neutral-600">
          Cari nama atau judul
        </label>
        <input id="media-q" name="q" type="search" defaultValue={q ?? ""} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700">
        <input type="checkbox" name="unused" value="1" defaultChecked={unused} className="size-4 rounded border-neutral-300" />
        Hanya yang tidak dipakai
      </label>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" className={secondaryButtonClass}>
          Terapkan
        </button>
        {filtered ? (
          <Link href="/admin/media" className={`${secondaryButtonClass} inline-block`}>
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}