import Link from "next/link";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  groupedModulesForRole,
  modulesForRole,
  moduleLabelForPath,
  rolesForPath,
} from "./modules";

export const instant = false;

type Summary = {
  treatmentsPublished: number;
  packages: number;
  promosActive: number;
  journalPublished: number;
  journalScheduled: number;
  eventsUpcoming: number;
  inquiriesNew: number;
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string; password?: string }>;
}) {
  const session = await requireSession();
  const modules = modulesForRole(session.role);
  const groups = groupedModulesForRole(session.role);
  const ready = modules.filter((m) => m.ready).length;
  const params = await searchParams;
  // Nilai `forbidden` berasal dari URL: hanya dipakai untuk mencari nama modul
  // di matriks, tidak pernah ditampilkan mentah.
  const forbiddenLabel = params.forbidden
    ? moduleLabelForPath(params.forbidden)
    : null;
  const forbiddenRoles = forbiddenLabel ? rolesForPath(params.forbidden!) : [];

  // Ringkasan tidak boleh membuat dashboard kosong saat DB bermasalah —
  // dashboard tetap tampil dengan nilai 0 dan catatan error.
  let summary: Summary = {
    treatmentsPublished: 0,
    packages: 0,
    promosActive: 0,
    journalPublished: 0,
    journalScheduled: 0,
    eventsUpcoming: 0,
    inquiriesNew: 0,
  };
  let summaryError = false;

  try {
    const now = new Date();

    const [
      treatmentsPublished,
      packages,
      promosActive,
      journalPublished,
      journalScheduled,
      eventsUpcoming,
      inquiriesNew,
    ] = await Promise.all([
      prisma.treatment.count({ where: { isPublished: true } }),
      prisma.package.count({ where: { isPublished: true } }),
      prisma.promo.count({
        where: {
          isPublished: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
      }),
      prisma.journalPost.count({ where: { status: "PUBLISHED" } }),
      prisma.journalPost.count({ where: { status: "SCHEDULED" } }),
      prisma.eventItem.count({
        where: {
          isPublished: true,
          OR: [{ startDate: null }, { startDate: { gte: now } }],
        },
      }),
      prisma.corporateInquiry.count({ where: { status: "NEW" } }),
    ]);

    summary = {
      treatmentsPublished,
      packages,
      promosActive,
      journalPublished,
      journalScheduled,
      eventsUpcoming,
      inquiriesNew,
    };
  } catch {
    summaryError = true;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {params.forbidden ? (
        <p
          role="alert"
          className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {forbiddenLabel
            ? `Anda tidak punya akses ke modul “${forbiddenLabel}”. Modul ini hanya bisa dibuka role ${forbiddenRoles.join(" atau ")}.`
            : "Anda tidak punya akses ke halaman tersebut."}{" "}
          Hubungi pemegang role ADMIN bila Anda memerlukannya.
        </p>
      ) : null}
      {params.password === "changed" ? (
        <p
          role="status"
          className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Kata sandi berhasil diganti. Sesi di perangkat lain sudah dikeluarkan.
        </p>
      ) : null}

      <h1 className="text-xl font-semibold text-neutral-900">
        Selamat datang, {session.email}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Anda masuk sebagai <strong>{session.role}</strong>.{" "}
        {session.role === "ADMIN"
          ? "Anda dapat mengelola seluruh modul, termasuk pengaturan sistem dan akun admin."
          : "Anda dapat mengelola modul konten website KAMA Spa. Pengaturan sistem (akun admin, kontak & umum, backup) hanya untuk role ADMIN."}
      </p>

      <h2 className="mt-6 text-sm font-semibold text-neutral-800">
        Modul yang bisa Anda buka
      </h2>
      {groups.map((group) => (
        <section key={group.id} className="mt-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {group.label}
          </h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.modules.map((m) => (
              <li key={m.no}>
                {m.ready ? (
                  <Link
                    href={m.href}
                    className="block h-full rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-400"
                  >
                    <span className="block text-sm text-neutral-800">{m.label}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500">{m.hint}</span>
                  </Link>
                ) : (
                  <span className="block h-full rounded-md border border-dashed border-neutral-200 px-3 py-2 text-sm text-neutral-400">
                    {m.label} (segera)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Treatment published" value={summary.treatmentsPublished} />
        <StatCard label="Package published" value={summary.packages} />
        <StatCard label="Promo aktif" value={summary.promosActive} />
        <StatCard
          label="Artikel journal published"
          value={summary.journalPublished}
        />
        <StatCard label="Artikel terjadwal" value={summary.journalScheduled} />
        <StatCard label="Event mendatang" value={summary.eventsUpcoming} />
        <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:col-span-2 lg:col-span-3">
          <p className="text-sm text-neutral-600">Inquiry corporate baru</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {summary.inquiriesNew}
          </p>
          <Link
            href="/admin/corporate/inquiries"
            className="mt-2 inline-block text-sm text-neutral-700 underline-offset-2 hover:underline"
          >
            Lihat daftar inquiry →
          </Link>
        </div>
      </div>

      {summaryError ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Ringkasan konten tidak dapat dimuat karena kesalahan database. Halaman
          dashboard tetap bisa digunakan.
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-700">
          Progres modul: <strong>{ready}</strong> dari{" "}
          <strong>{modules.length}</strong> modul siap digunakan.
        </p>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={ready}
          aria-valuemin={0}
          aria-valuemax={modules.length}
        >
          <div
            className="h-full bg-neutral-900 transition-all"
            style={{ width: `${(ready / modules.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Modul bertanda “segera” pada menu samping sedang dalam pengerjaan
          (Tahap 2 — target 30 November 2026).
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
