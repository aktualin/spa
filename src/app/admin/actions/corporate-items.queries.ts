"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ORDER } from "./corporate-items.helpers";

export async function listCorporateItems() {
  await requireSession();

  const [programs, steps, clients] = await Promise.all([
    prisma.corporateProgram.findMany({ orderBy: ORDER }),
    prisma.corporateStep.findMany({ orderBy: ORDER }),
    prisma.corporateClient.findMany({ orderBy: ORDER }),
  ]);
  return { programs, steps, clients };
}

export async function getCorporateProgram(id: string) {
  await requireSession();
  return prisma.corporateProgram.findUnique({ where: { id } });
}

export async function getCorporateStep(id: string) {
  await requireSession();
  return prisma.corporateStep.findUnique({ where: { id } });
}

export async function getCorporateClient(id: string) {
  await requireSession();
  return prisma.corporateClient.findUnique({ where: { id } });
}