import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createJsonExportStream } from "@/lib/backup/export";
import { jsonExportLimiter } from "@/lib/backup/limits";
import { exportFileName } from "@/lib/domain/backup";
import { prisma } from "@/lib/prisma";

/**
 * `POST /api/admin/backup/export` — tombol "Unduh ekspor JSON" di
 * /admin/status. Dikirim sebagai form POST biasa: browser langsung mengunduh
 * berkas (attachment) dan halaman tidak berpindah.
 *
 * Proxy sudah menolak POST lintas origin dan permintaan tanpa token. Di sini:
 * sesi dicocokkan ke database, role wajib ADMIN, centang persetujuan PII
 * wajib, dan rate limit per admin. Isi ekspor tidak disimpan di server/storage.
 */

function back(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/admin/status?${query}#backup-manual`, request.url), 303);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.mustChangePassword) {
    return NextResponse.json({ error: "Ganti kata sandi terlebih dahulu." }, { status: 403 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak: khusus role ADMIN." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return back(request, "exportError=invalid");
  }

  if (formData.get("confirm") !== "on") return back(request, "exportError=confirm");
  const includePersonalData = formData.get("includePersonalData") === "on";

  const limit = jsonExportLimiter.check(session.userId);
  if (!limit.allowed) return back(request, "exportError=rate");

  const format = includePersonalData
    ? "JSON semua tabel (termasuk data inquiry)"
    : "JSON semua tabel (tanpa data inquiry)";

  const stream = createJsonExportStream({
    includePersonalData,
    exportedBy: session.email,
    async onFinish(result) {
      await prisma.backupRun.create({
        data: {
          kind: "MANUAL",
          status: result.ok ? "SUCCESS" : "FAILED",
          format,
          sizeBytes: result.sizeBytes,
          location: "Diunduh langsung ke perangkat admin (tidak disimpan di server)",
          note: result.ok ? `SHA-256: ${result.sha256}` : result.reason,
          triggeredById: session.userId,
        },
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFileName(new Date())}"`,
      "cache-control": "no-store, private",
      "x-content-type-options": "nosniff",
    },
  });
}
