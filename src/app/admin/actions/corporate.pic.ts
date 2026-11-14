"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { STATIC_HERO_TITLE, validatePicInput } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { revalidateCorporate } from "./corporate-items.helpers";
import type { ActionState } from "./corporate.helpers";
import { formStr } from "./form-utils";

export async function savePicAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validatePicInput({
    name: formStr(formData, "picName"),
    email: formStr(formData, "picEmail"),
    phone: formStr(formData, "picPhone"),
  });
  if (!result.ok) return { error: result.error };

  const data = {
    picName: result.data.name,
    picEmail: result.data.email,
    picPhone: result.data.phone,
  };

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", heroTitle: STATIC_HERO_TITLE, ...data },
    update: data,
  });

  revalidateCorporate();
  revalidatePath("/admin/corporate/pic");
  redirect("/admin/corporate/pic?saved=1");
}