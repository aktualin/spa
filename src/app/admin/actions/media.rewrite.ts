import { Prisma } from "@prisma/client";

import { dbTable } from "@/lib/db-schema";
import {
  MEDIA_HTML_COLUMNS,
  MEDIA_URL_ARRAY_COLUMNS,
  MEDIA_URL_COLUMNS,
  extractImageUrls,
} from "@/lib/domain/media";
import { prisma } from "@/lib/prisma";

import { delegateOf, str, strList } from "./media.describe";

/**
 * Arahkan semua kolom gambar, array URL, dan isi HTML yang memakai URL lama
 * ke URL baru. Dipanggil di dalam transaksi penggantian berkas.
 */
export async function replaceMediaReferences(
  tx: Prisma.TransactionClient,
  oldUrl: string,
  newUrl: string,
): Promise<void> {
  for (const column of MEDIA_URL_COLUMNS) {
    await delegateOf(tx, column.model).updateMany({
      where: { [column.field]: oldUrl },
      data: { [column.field]: newUrl },
    });
  }

  for (const column of MEDIA_URL_ARRAY_COLUMNS) {
    const table = dbTable(column.table);
    const field = Prisma.raw(`"${column.field}"`);
    await tx.$executeRaw`UPDATE ${table} SET ${field} = array_replace(${field}, ${oldUrl}, ${newUrl}) WHERE ${oldUrl} = ANY(${field})`;
  }

  // Identifier tabel/kolom berasal dari konstanta MEDIA_HTML_COLUMNS;
  // nilai URL dikirim sebagai parameter terikat.
  for (const column of MEDIA_HTML_COLUMNS) {
    const table = dbTable(column.table);
    const field = Prisma.raw(`"${column.field}"`);
    await tx.$executeRaw`UPDATE ${table} SET ${field} = REPLACE(${field}, ${oldUrl}, ${newUrl}) WHERE strpos(${field}, ${oldUrl}) > 0`;
  }
}

/** Kumpulkan semua URL bucket yang dipakai konten (kolom, HTML, dan array). */
export async function collectContentUrls(prefix: string): Promise<Set<string>> {
  const found = new Set<string>();

  for (const column of MEDIA_URL_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { startsWith: prefix } },
      select: { [column.field]: true },
    });
    for (const row of rows) found.add(str(row[column.field]));
  }
  for (const column of MEDIA_HTML_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { contains: prefix } },
      select: { [column.field]: true },
    });
    for (const row of rows) {
      for (const url of extractImageUrls(str(row[column.field]))) found.add(url);
    }
  }
  for (const column of MEDIA_URL_ARRAY_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { NOT: { [column.field]: { isEmpty: true } } },
      select: { [column.field]: true },
    });
    for (const row of rows) {
      for (const url of strList(row[column.field])) {
        if (url.startsWith(prefix)) found.add(url);
      }
    }
  }

  return found;
}