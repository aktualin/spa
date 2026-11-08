import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { isJournalVisible } from "@/lib/domain/visibility";

import { getPost, listJournalTaxonomy } from "../../actions/journal";
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

  const [post, taxonomy] = await Promise.all([
    isNew ? null : getPost(id),
    listJournalTaxonomy(),
  ]);
  if (!isNew && !post) notFound();

  const data: JournalFormData = post
    ? {
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
        isPublic: isJournalVisible(post, new Date()),
      }
    : {
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
        isPublic: false,
      };

  return <JournalForm post={data} taxonomy={taxonomy} />;
}
