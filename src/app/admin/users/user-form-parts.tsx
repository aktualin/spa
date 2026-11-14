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
        Kata sandi sementara untuk <strong>{email}</strong>:
      </p>
      <p className="select-all rounded bg-white px-3 py-2 font-mono text-base tracking-wide text-neutral-900">
        {password}
      </p>
      <p>
        Salin dan sampaikan lewat jalur terpisah (misalnya pesan langsung).
        Kata sandi ini <strong>hanya ditampilkan sekali</strong> dan tidak
        disimpan dalam bentuk yang bisa dibaca. Pemilik akun wajib menggantinya
        saat login pertama.
      </p>
    </div>
  );
}