import Link from "next/link";

import { canMoveBranch } from "@/lib/domain/branch";

import {
  moveBranchAction,
  toggleBranchPublishedAction,
  type listBranches,
} from "../actions/branches";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge } from "../settings/_components/form-ui";

type Branch = Awaited<ReturnType<typeof listBranches>>[number];

/** Satu baris cabang: alamat, urutan, dan tombol tampil/sembunyi. */
export function BranchRow({
  branch,
  branches,
  index,
}: {
  branch: Branch;
  branches: Branch[];
  index: number;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/branches/${branch.id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            {branch.name} | {branch.area}
          </Link>
          {branch.tag ? <Badge>{branch.tag}</Badge> : null}
          {!branch.isPublished ? <Badge tone="muted">Disembunyikan</Badge> : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          /{branch.slug}
          {branch.address ? ` · ${branch.address}` : " · alamat belum diisi"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <form action={moveBranchAction}>
            <input type="hidden" name="id" value={branch.id} />
            <input type="hidden" name="direction" value="up" />
            <SmallSubmit
              title={`Naikkan urutan ${branch.name}`}
              disabled={!canMoveBranch(branches, index, "up")}
            >
              ↑
            </SmallSubmit>
          </form>
          <form action={moveBranchAction}>
            <input type="hidden" name="id" value={branch.id} />
            <input type="hidden" name="direction" value="down" />
            <SmallSubmit
              title={`Turunkan urutan ${branch.name}`}
              disabled={!canMoveBranch(branches, index, "down")}
            >
              ↓
            </SmallSubmit>
          </form>
        </div>
        <form action={toggleBranchPublishedAction}>
          <input type="hidden" name="id" value={branch.id} />
          <SmallSubmit
            title={
              branch.isPublished
                ? `Sembunyikan ${branch.name} dari website`
                : `Tampilkan ${branch.name} di website`
            }
          >
            {branch.isPublished ? "Sembunyikan" : "Tampilkan"}
          </SmallSubmit>
        </form>
        <Link
          href={`/admin/branches/${branch.id}`}
          className="text-neutral-800 underline"
        >
          Ubah
        </Link>
      </div>
    </li>
  );
}