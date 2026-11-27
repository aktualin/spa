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
            ? `You do not have access to the “${forbiddenLabel}” module. This module can only be opened by the ${forbiddenRoles.join(" or ")} role.`
            : "You do not have access to that page."}{" "}
          Contact an ADMIN if you need access.
        </p>
      ) : null}
      {password === "changed" ? (
        <p
          role="status"
          className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Password changed successfully. Sessions on other devices have been logged out.
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
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(now);
  const roleNote =
    role === "ADMIN"
      ? "Full access, including system settings and admin accounts."
      : "Manages site content. System settings can only be opened by ADMIN.";
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          <span className="font-medium text-neutral-700">{email}</span>
          {" · "}
          {role}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">{roleNote}</p>
      </div>
      <p className="text-xs text-neutral-400">Data as of {formattedDate}</p>
    </header>
  );
}