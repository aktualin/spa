import { revalidatePath } from "next/cache";

import {
  MEDIA_HTML_COLUMNS,
  MEDIA_URL_ARRAY_COLUMNS,
  MEDIA_URL_COLUMNS,
} from "@/lib/domain/media";
import { prisma } from "@/lib/prisma";

import { DESCRIBE, bucketPrefix, delegateOf, str, strList } from "./media.describe";
import type { MediaUsage } from "./media.types";

/**
 * Pemakaian setiap URL: kolom gambar yang nilainya sama persis, ditambah
 * kolom HTML yang memuat URL tersebut di dalam isinya.
 */
export async function usageByUrl(urls: readonly string[]): Promise<Map<string, MediaUsage[]>> {
  const result = new Map<string, MediaUsage[]>(urls.map((url) => [url, []]));
  if (urls.length === 0) return result;

  const urlList = [...urls];
  const add = (url: string, usage: MediaUsage) => result.get(url)?.push(usage);

  const columnQueries = MEDIA_URL_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { in: urlList } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      add(str(row[column.field]), {
        label: column.label,
        name: describe.name(row),
        href: describe.href(row),
      });
    }
  });

  // Hanya baris yang memuat URL bucket kita yang perlu dicek isinya.
  const prefix = bucketPrefix();
  const htmlQueries = MEDIA_HTML_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { contains: prefix } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      const html = str(row[column.field]);
      for (const url of urlList) {
        if (html.includes(url)) {
          add(url, { label: column.label, name: describe.name(row), href: describe.href(row) });
        }
      }
    }
  });

  const arrayQueries = MEDIA_URL_ARRAY_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { hasSome: urlList } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      for (const url of strList(row[column.field])) {
        add(url, { label: column.label, name: describe.name(row), href: describe.href(row) });
      }
    }
  });

  await Promise.all([...columnQueries, ...htmlQueries, ...arrayQueries]);
  return result;
}

export async function usageOf(url: string): Promise<MediaUsage[]> {
  return (await usageByUrl([url])).get(url) ?? [];
}

export function revalidateMediaPages(id?: string) {
  revalidatePath("/admin/media");
  if (id) revalidatePath(`/admin/media/${id}`);
}