"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  createsRedirectLoop,
  normalizePath,
  validateRedirectInput,
} from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const NOTE_MAX = 200;

function revalidateRedirects() {
  updateTag(CONTENT_TAGS.redirects);
  revalidatePath("/admin/redirects");
}

export async function saveRedirectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const rawFrom = (text(formData, "fromPath") ?? "").trim();
  const toPath = (text(formData, "toPath") ?? "").trim();
  const statusCode = Number(text(formData, "statusCode") ?? 301);
  const note = (text(formData, "note") ?? "").trim() || null;

  if (!rawFrom) return { error: "URL asal wajib diisi." };
  if (!toPath) return { error: "URL tujuan wajib diisi." };
  if (statusCode !== 301 && statusCode !== 302) {
    return { error: "Jenis redirect harus 301 (permanen) atau 302 (sementara)." };
  }
  if (note && note.length > NOTE_MAX) {
    return { error: `Catatan maksimal ${NOTE_MAX} karakter.` };
  }

  const invalid = validateRedirectInput(rawFrom, toPath);
  if (invalid) return { error: invalid };

  const fromPath = normalizePath(rawFrom);

  const clash = await prisma.redirect.findFirst({
    where: { fromPath, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Sudah ada redirect dari ${fromPath}. Hapus atau ubah yang lama dulu.` };
  }

  // Path satu segmen bisa jadi alamat halaman bebas yang sedang tayang.
  const livePage = await prisma.staticPage.findFirst({
    where: { slug: fromPath.slice(1), status: "PUBLISHED" },
    select: { title: true },
  });
  if (livePage) {
    return {
      error: `${fromPath} adalah alamat halaman "${livePage.title}" yang sedang terbit. Redirect akan menyembunyikan halaman itu.`,
    };
  }

  const existing = await prisma.redirect.findMany({
    where: id ? { NOT: { id } } : {},
    select: { fromPath: true, toPath: true },
  });
  if (createsRedirectLoop(existing, fromPath, toPath)) {
    return {
      error:
        "Redirect ini membentuk putaran (alamat akhirnya kembali ke URL asal). Periksa redirect lain yang menuju URL ini.",
    };
  }

  const data = { fromPath, toPath, statusCode, note, source: "manual" };
  try {
    if (id) {
      await prisma.redirect.update({ where: { id }, data });
    } else {
      await prisma.redirect.create({ data });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: `Sudah ada redirect dari ${fromPath}.` };
    }
    throw error;
  }

  revalidateRedirects();
  redirect("/admin/redirects?saved=1");
}

export async function deleteRedirectAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.redirect.deleteMany({ where: { id } });

  revalidateRedirects();
  redirect("/admin/redirects?deleted=1");
}

export async function listRedirects() {
  await requireRole(CONTENT_ROLES);

  return prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
}
