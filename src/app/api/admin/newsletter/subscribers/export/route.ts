import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

// Proxy sudah menolak permintaan tanpa token untuk `/api/admin/*`; cek sesi di
// sini tetap wajib karena proxy tidak menyentuh database.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!CONTENT_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const rows = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "asc" },
    include: { branch: { select: { name: true, area: true } } },
  });

  const csvEscape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const header = "email,status,branch,subscribedAt,unsubscribedAt";
  const lines = rows.map((row) =>
    [
      csvEscape(row.email),
      row.status,
      csvEscape(row.branch ? `${row.branch.name} | ${row.branch.area}` : ""),
      row.subscribedAt.toISOString(),
      row.unsubscribedAt ? row.unsubscribedAt.toISOString() : "",
    ].join(","),
  );

  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="newsletter-subscribers.csv"',
      "cache-control": "no-store",
    },
  });
}
