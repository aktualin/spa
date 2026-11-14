import type { AdminRoleName } from "@/lib/domain/roles";

export function DashboardBanners({
  forbidden,
  password,
  forbiddenLabel,
  forbiddenRoles,
}: {
  forbidden?: string;
  password?: string;
  forbiddenLabel: string | null;
  forbiddenRoles: readonly AdminRoleName[];
}) {
  return (
    <>
      {forbidden ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {forbiddenLabel
            ? `Anda tidak punya akses ke modul “${forbiddenLabel}”. Modul ini hanya bisa dibuka role ${forbiddenRoles.join(" atau ")}.`
            : "Anda tidak punya akses ke halaman tersebut."}{" "}
          Hubungi pemegang role ADMIN bila Anda memerlukannya.
        </p>
      ) : null}
      {password === "changed" ? (
        <p
          role="status"
          className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Kata sandi berhasil diganti. Sesi di perangkat lain sudah dikeluarkan.
        </p>
      ) : null}
    </>
  );
}

export function DashboardHeader({
  email,
  role,
  now,
}: {
  email: string;
  role: string;
  now: Date;
}) {
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(now);
  const roleNote =
    role === "ADMIN"
      ? "Akses penuh, termasuk pengaturan sistem dan akun admin."
      : "Mengelola konten situs. Pengaturan sistem hanya bisa dibuka ADMIN.";
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Ringkasan
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          <span className="font-medium text-neutral-700">{email}</span>
          {" · "}
          {role}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">{roleNote}</p>
      </div>
      <p className="text-xs text-neutral-400">Data per {formattedDate}</p>
    </header>
  );
}