"use client";

import type { ActionState } from "../actions/users";

export const initialState: ActionState = { error: null };

/**
 * Kata sandi sementara yang dibuat sistem. Hanya ada di memori browser selama
 * halaman ini terbuka; setelah pindah halaman tidak bisa ditampilkan lagi.
 */
export function TemporaryPasswordNotice({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return (
    <div
      role="status"
      className="mt-4 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p>
        Temporary password for <strong>{email}</strong>:
      </p>
      <p className="select-all rounded bg-white px-3 py-2 font-mono text-base tracking-wide text-neutral-900">
        {password}
      </p>
      <p>
        Copy it and share it through a separate channel (for example a direct
        message). This password is <strong>shown only once</strong> and is not
        stored in a readable form. The account owner must change it at their
        first login.
      </p>
    </div>
  );
}