import type { Metadata } from "next";

import { requireSession } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/domain/password-policy";

import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Change Password — KAMA Spa",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function ChangePasswordPage() {
  const session = await requireSession({ allowMustChangePassword: true });

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Change password
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{session.email}</p>
      </div>

      {session.mustChangePassword ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This account's password was created by another admin. For security,
          change it to your own password before using the dashboard.
        </p>
      ) : null}

      <ChangePasswordForm minLength={MIN_PASSWORD_LENGTH} />

      <p className="text-xs text-neutral-500">
        After the password is changed, sessions on other devices are logged
        out automatically.
      </p>
    </div>
  );
}
