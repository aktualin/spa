/**
 * Kelas CSS bersama untuk form admin.
 *
 * Dipisah dari `form-ui.tsx` (yang ber-`"use client"`) supaya nilai non-komponen
 * seperti `inputClass` bisa diimpor tanpa menjadi client reference.
 */
export const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
