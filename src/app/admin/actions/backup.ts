"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { dispatchBackupWorkflow } from "@/lib/backup/github";
import { githubDispatchLimiter } from "@/lib/backup/limits";
import { buildHandoverNote, parseHandoverInput } from "@/lib/domain/backup";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { formStr } from "./form-utils";

/** Modul 19 (Backup & Status) — seluruh aksi khusus ADMIN. */

export type BackupActionState = { error: string | null; message?: string };

/** 30 catatan backup terbaru + catatan sukses terakhir per jenis. */
export async function getBackupOverview() {
  await requireRole(ADMIN_ONLY_ROLES);

  const include = { triggeredBy: { select: { name: true, email: true } } } as const;
  const [runs, lastAuto, lastAutoAttempt, lastManual, lastHandover] = await Promise.all([
    prisma.backupRun.findMany({ orderBy: { createdAt: "desc" }, take: 30, include }),
    prisma.backupRun.findFirst({
      where: { kind: "AUTO", status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.backupRun.findFirst({ where: { kind: "AUTO" }, orderBy: { createdAt: "desc" } }),
    prisma.backupRun.findFirst({
      where: { kind: "MANUAL", status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.backupRun.findFirst({ where: { kind: "HANDOVER" }, orderBy: { createdAt: "desc" } }),
  ]);

  return { runs, lastAuto, lastAutoAttempt, lastManual, lastHandover };
}

/** Catat 1 salinan backup lengkap (pg_dump) yang diserahkan saat serah terima. */
export async function recordHandoverBackupAction(
  _prev: BackupActionState,
  formData: FormData,
): Promise<BackupActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = parseHandoverInput({
    location: formStr(formData, "location"),
    sha256: formStr(formData, "sha256"),
    sizeBytes: formStr(formData, "sizeBytes"),
    restoreTested: formData.get("restoreTested") === "on",
    note: formStr(formData, "note"),
  });
  if (!parsed.ok) return { error: parsed.error };

  await prisma.backupRun.create({
    data: {
      kind: "HANDOVER",
      status: "SUCCESS",
      format: "pg_dump .sql.gz (scripts/backup-db.sh)",
      sizeBytes: parsed.value.sizeBytes,
      location: parsed.value.location,
      note: buildHandoverNote(parsed.value),
      triggeredById: session.userId,
    },
  });

  revalidatePath("/admin/status");
  redirect("/admin/status?handover=1#riwayat");
}

/** Picu workflow GitHub Actions (pg_dump terenkripsi) sekarang juga. */
export async function triggerGithubBackupAction(
  _prev: BackupActionState,
  _formData: FormData,
): Promise<BackupActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const limit = githubDispatchLimiter.check(session.userId);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return { error: `Terlalu sering. Coba lagi dalam ${minutes} menit.` };
  }

  const result = await dispatchBackupWorkflow(session.userId);
  if (!result.ok) return { error: result.error };

  return {
    error: null,
    message:
      "Backup sedang dijalankan di GitHub Actions. Hasilnya tercatat otomatis di riwayat setelah selesai (biasanya 2–5 menit) — muat ulang halaman ini nanti.",
  };
}
