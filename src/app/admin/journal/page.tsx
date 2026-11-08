import Link from "next/link";

import { listPosts } from "../actions/journal";
import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { journalStatusMeta } from "./journal-status";

export const instant = false;

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [posts, params] = await Promise.all([listPosts(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Journal"
        subtitle={`${posts.length} artikel.`}
        action={
          <Link href="/admin/journal/new" className={primaryLinkClass}>
            Tulis artikel
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Artikel dihapus."
      />

      <div className="mt-6">
        {posts.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada artikel journal.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {posts.map((post) => {
              const meta = journalStatusMeta[post.status];
              return (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
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
                        /{post.slug}
                        {post.category ? ` · ${post.category}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-neutral-500">
                    <p>{formatWibDateTime(post.publishedAt)}</p>
                    <Link
                      href={`/admin/journal/${post.id}/preview`}
                      className="text-neutral-700 underline"
                    >
                      Preview
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
