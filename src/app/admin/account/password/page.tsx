import type { Metadata } from "next";

import { requireSession } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/domain/password-policy";

import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Ganti Kata Sandi — KAMA Spa",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function ChangePasswordPage() {
  const session = await requireSession({ allowMustChangePassword: true });

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Ganti kata sandi
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{session.email}</p>
      </div>

      {session.mustChangePassword ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Kata sandi akun ini dibuat oleh admin lain. Demi keamanan, ganti
          dengan kata sandi milik Anda sendiri sebelum memakai dashboard.
        </p>
      ) : null}

      <ChangePasswordForm minLength={MIN_PASSWORD_LENGTH} />

      <p className="text-xs text-neutral-500">
        Setelah kata sandi diganti, sesi di perangkat lain otomatis keluar.
      </p>
    </div>
  );
}
