"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireModuleRole } from "@/app/admin/access";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { isSafeCtaHref, isSafeImageUrl } from "@/lib/domain/homepage-banner";
import {
  PAGE_COPY_FIELDS,
  type PageCopyField,
} from "@/lib/domain/page-copy";
import { prisma } from "@/lib/prisma";

export type PageCopyFormState = {
  error: string | null;
  values?: Record<string, string>;
  attempt?: number;
};

export async function getAdminPageCopy(): Promise<Record<string, string>> {
  await requireModuleRole("/admin/page-copy");
  const rows = await prisma.contentBlock.findMany({
    select: { key: true, value: true },
  });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

function validate(field: PageCopyField, value: string): string | null {
  if (value.length > (field.maxLength ?? 5000)) {
    return `${field.label} maksimal ${field.maxLength} karakter.`;
  }
  if (!value) return null;
  if (field.type === "url" && !isSafeCtaHref(value)) {
    return `${field.label} harus berupa path internal, anchor, atau URL https://.`;
  }
  if (field.type === "image" && !isSafeImageUrl(value)) {
    return `${field.label} harus berupa URL gambar https:// atau path internal.`;
  }
  return null;
}

export async function savePageCopyAction(
  prevState: PageCopyFormState,
  formData: FormData,
): Promise<PageCopyFormState> {
  await requireModuleRole("/admin/page-copy");

  const values: Record<string, string> = {};
  for (const field of PAGE_COPY_FIELDS) {
    values[field.key] = String(formData.get(field.key) ?? "").trim();
    const error = validate(field, values[field.key]);
    if (error) {
      return { error, values, attempt: (prevState.attempt ?? 0) + 1 };
    }
  }

  await prisma.$transaction(
    PAGE_COPY_FIELDS.map((field) => {
      const key = field.key;
      if (!values[key]) {
        return prisma.contentBlock.deleteMany({ where: { key } });
      }
      return prisma.contentBlock.upsert({
        where: { key },
        create: { key, group: groupFor(key), value: values[key] },
        update: { value: values[key], group: groupFor(key) },
      });
    }),
  );

  updateTag(CONTENT_TAGS.pageCopy);
  revalidatePath("/admin/page-copy");
  revalidatePath("/", "layout");
  redirect("/admin/page-copy?saved=1");
}

function groupFor(key: string): string {
  return key.includes(".") ? key.slice(0, key.indexOf(".")) : "global";
}
