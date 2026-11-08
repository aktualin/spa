import Link from "next/link";

import { effectiveJournalStatus, journalPath } from "@/lib/domain/journal";

import { listPosts } from "../actions/journal";
import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { JOURNAL_STATUSES, journalStatusMeta, type JournalStatus } from "./journal-status";

export const instant = false;

const FILTERS: { value: JournalStatus | null; label: string }[] = [
  { value: null, label: "Semua" },
  ...JOURNAL_STATUSES.map((value) => ({ value, label: journalStatusMeta[value].label })),
];

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; status?: string }>;
}) {
  const [posts, params] = await Promise.all([listPosts(), searchParams]);
  const now = new Date();

  const rows = posts.map((post) => ({ post, status: effectiveJournalStatus(post, now) }));
  const active = JOURNAL_STATUSES.find((value) => value === params.status) ?? null;
  const shown = active ? rows.filter((row) => row.status === active) : rows;
  const count = (value: JournalStatus | null) =>
    value ? rows.filter((row) => row.status === value).length : rows.length;

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

      <nav aria-label="Saring status" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const current = filter.value === active;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/journal?status=${filter.value}` : "/admin/journal"}
              aria-current={current ? "page" : undefined}
              className={`rounded-full border px-3 py-1 text-xs ${
                current
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {filter.label} ({count(filter.value)})
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        {shown.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {posts.length === 0 ? "Belum ada artikel journal." : "Tidak ada artikel dengan status ini."}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {shown.map(({ post, status }) => {
              const meta = journalStatusMeta[status];
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
                        {journalPath(post.slug)}
                        {post.category ? ` · ${post.category}` : ""}
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
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
