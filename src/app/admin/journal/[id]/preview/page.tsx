import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { effectiveJournalStatus } from "@/lib/domain/journal";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { formatWibDateTime } from "../../../promos/_kit/schema";
import { Badge } from "../../../promos/_kit/list-ui";
import { journalStatusMeta } from "../../journal-status";

export const instant = false;

/**
 * Preview artikel tanpa harus publish. Isi dirender dari versi tersimpan
 * terbaru di database dan disanitasi ulang saat render.
 */
export default async function JournalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;

  const post = await prisma.journalPost.findUnique({ where: { id } });
  if (!post) notFound();

  const meta = journalStatusMeta[effectiveJournalStatus(post, new Date())];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/journal/${post.id}`}
        className="text-sm text-neutral-600 hover:underline"
      >
        ← Kembali ke editor
      </Link>

      <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
        Preview artikel tersimpan. Konten di bawah belum tentu sama dengan
        tampilan publik selama status artikel bukan Terbit atau jadwalnya belum
        tiba.
      </p>

      <article className="mt-6">
        <header className="border-b border-neutral-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {post.category ? (
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                {post.category}
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
            {post.title}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            {formatWibDateTime(post.publishedAt)}
            {post.tags.length > 0 ? ` · ${post.tags.map((t) => `#${t}`).join(" ")}` : ""}
          </p>
          {post.excerpt ? (
            <p className="mt-3 text-sm text-neutral-600">{post.excerpt}</p>
          ) : null}
        </header>

        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.title}
            className="mt-6 w-full rounded-lg object-cover"
          />
        ) : null}

        <div
          className="prose prose-sm mt-6 max-w-none text-neutral-800 [&_a]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyHtml) }}
        />
      </article>
    </div>
  );
}
