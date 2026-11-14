"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { revalidateRedirects } from "./redirects.helpers";

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