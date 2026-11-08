import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { EditUserForm } from "../edit-user-form";
import { requireAdminPage } from "../guard";

export const instant = false;

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminPage();

  const { id } = await params;
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!user) notFound();

  return (
    <EditUserForm
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isSelf: session.userId === user.id,
      }}
    />
  );
}
