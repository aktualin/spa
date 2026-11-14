import Link from "next/link";

import { unlockUserAction, type listUsers } from "../actions/users";
import { formatDateTime } from "./format-date";

type User = Awaited<ReturnType<typeof listUsers>>[number];

/** Satu baris akun admin: role, status, dan tombol buka kunci. */
export function UserRow({
  user,
  now,
  selfId,
}: {
  user: User;
  now: Date;
  selfId: string;
}) {
  const locked = user.lockedUntil && user.lockedUntil > now;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/users/${user.id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            {user.name}
          </Link>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
            {user.role}
          </span>
          {user.id === selfId ? (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sky-800">
              Anda
            </span>
          ) : null}
          {user.mustChangePassword ? (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
              Wajib ganti kata sandi
            </span>
          ) : null}
          {!user.isActive ? (
            <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white">
              Nonaktif
            </span>
          ) : null}
          {locked ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-800">
              Terkunci
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {user.email} · login terakhir{" "}
          {user.lastLoginAt
            ? formatDateTime(user.lastLoginAt)
            : "belum pernah"}
        </p>
      </div>

      {locked ? (
        <form action={unlockUserAction}>
          <input type="hidden" name="id" value={user.id} />
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Buka kunci
          </button>
        </form>
      ) : null}
    </li>
  );
}