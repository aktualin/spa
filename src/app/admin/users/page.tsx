import Link from "next/link";

import { listUsers, unlockUserAction } from "../actions/users";
import { formatDateTime } from "./format-date";
import { requireAdminPage } from "./guard";

export const instant = false;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; unlocked?: string }>;
}) {
  await requireAdminPage();

  const [users, params] = await Promise.all([listUsers(), searchParams]);
  const now = new Date();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Pengguna Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {users.length} akun terdaftar. Modul ini hanya bisa dikelola role
            ADMIN.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah akun
        </Link>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Perubahan akun tersimpan.
        </p>
      ) : null}
      {params.unlocked ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Akun berhasil dibuka kuncinya.
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {users.map((user) => {
          const locked = user.lockedUntil && user.lockedUntil > now;
          return (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
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
        })}
      </ul>
    </div>
  );
}
