import Link from "next/link";

import { listUsers } from "../actions/users";
import { requireAdminPage } from "./guard";
import { UserRow } from "./users-list";

export const instant = false;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; unlocked?: string; deleted?: string }>;
}) {
  const session = await requireAdminPage();

  const [users, params] = await Promise.all([listUsers(), searchParams]);
  const now = new Date();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Admin Users
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {users.length} registered accounts. This module can only be managed
            by the ADMIN role.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Add account
        </Link>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Account changes saved.
        </p>
      ) : null}
      {params.deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Account deleted successfully.
        </p>
      ) : null}
      {params.unlocked ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Account unlocked successfully.
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {users.map((user) => (
          <UserRow key={user.id} user={user} now={now} selfId={session.userId} />
        ))}
      </ul>
    </div>
  );
}
