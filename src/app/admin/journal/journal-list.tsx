import Link from "next/link";

import { journalPath } from "@/lib/domain/journal";

import type { listPosts } from "../actions/journal";
import { Badge, Thumb } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { journalStatusMeta, type JournalStatus } from "./journal-status";

type Post = Awaited<ReturnType<typeof listPosts>>[number];

/** Satu baris artikel journal: status, tanggal terbit, preview, dan tautan situs. */
export function PostRow({ post, status }: { post: Post; status: JournalStatus }) {
  const meta = journalStatusMeta[status];
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={post.coverUrl} alt={post.title} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/journal/${post.id}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {post.title}
            </Link>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {journalPath(post.slug)}
            {post.category ? ` · ${post.category.name}` : ""}
            {post.tags.length > 0 ? ` · ${post.tags.map((t) => `#${t}`).join(" ")}` : ""}
          </p>
        </div>
      </div>

      <div className="text-right text-xs text-neutral-500">
        <p>
          {status === "SCHEDULED" ? "Terbit otomatis " : ""}
          {formatWibDateTime(post.publishedAt)}
        </p>
        <p className="mt-0.5 space-x-3">
          <Link
            href={`/admin/journal/${post.id}/preview`}
            className="text-neutral-700 underline"
          >
            Preview
          </Link>
          {status === "PUBLISHED" ? (
            <a
              href={journalPath(post.slug)}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-700 underline"
            >
              Lihat di situs
            </a>
          ) : null}
        </p>
      </div>
    </li>
  );
}