import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { toWibDateTimeInput } from "../../promos/_kit/schema";
import { JournalForm, type JournalFormData } from "../journal-form";

export const instant = false;

export default async function JournalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  const isNew = id === "new";

  let data: JournalFormData;

  if (isNew) {
    data = {
      id: null,
      title: "",
      slug: "",
      excerpt: "",
      bodyHtml: "",
      coverUrl: "",
      category: "",
      tags: "",
      status: "DRAFT",
      publishedAt: "",
      seoTitle: "",
      seoDescription: "",
    };
  } else {
    const post = await prisma.journalPost.findUnique({ where: { id } });
    if (!post) notFound();

    data = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      bodyHtml: post.bodyHtml,
      coverUrl: post.coverUrl ?? "",
      category: post.category ?? "",
      tags: post.tags.join(", "),
      status: post.status,
      publishedAt: toWibDateTimeInput(post.publishedAt),
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
    };
  }

  return <JournalForm post={data} />;
}
