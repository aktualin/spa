import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import {
  addNewsletterSubscriberAction,
  deleteNewsletterSubscriberAction,
  listNewsletterSubscribers,
  toggleNewsletterSubscriberAction,
} from "../../actions/newsletter";
import { Badge, PageHeader, StatusBanners } from "../../promos/_kit/list-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { AddSubscriberForm } from "./add-subscriber-form";

export const instant = false;

const FILTERS = [
  { value: undefined, label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "UNSUBSCRIBED", label: "Berhenti" },
] as const;

function listHref(status: string | null | undefined, page = 1): string {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/admin/newsletter/subscribers${qs ? `?${qs}` : ""}`;
}

export default async function AdminNewsletterSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; status?: string; page?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const [{ rows, total, page, pageCount, status, countByStatus }, branches] = await Promise.all([
    listNewsletterSubscribers({ status: params.status, page: params.page }),
    prisma.branch.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, area: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Subscriber Newsletter"
        subtitle={`${total} subscriber${status ? " pada filter ini" : ""}.`}
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/newsletter"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Kembali ke Newsletter
            </Link>
            <a
              href="/api/admin/newsletter/subscribers/export"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Export CSV
            </a>
          </div>
        }
      />

      <StatusBanners saved={params.saved} deleted={params.deleted} deletedLabel="Subscriber dihapus." />

      <div className="mt-6">
        <AddSubscriberForm action={addNewsletterSubscriberAction} branches={branches} />
      </div>

      <nav aria-label="Filter status" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (filter.value ?? null) === status;
          const count = filter.value ? countByStatus[filter.value] : null;
          return (
            <Link
              key={filter.label}
              href={listHref(filter.value)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
                  : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              }
            >
              {filter.label}
              {count !== null ? ` (${count})` : ""}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Belum ada subscriber pada filter ini.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((subscriber) => (
            <li key={subscriber.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{subscriber.email}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {subscriber.branch ? `${subscriber.branch.name} | ${subscriber.branch.area} · ` : ""}
                  {formatWibDateTime(subscriber.subscribedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={subscriber.status === "ACTIVE" ? "green" : "muted"}>
                  {subscriber.status === "ACTIVE" ? "Aktif" : "Berhenti"}
                </Badge>
                <form action={toggleNewsletterSubscriberAction}>
                  <input type="hidden" name="id" value={subscriber.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={subscriber.status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE"}
                  />
                  <button type="submit" className="text-xs text-neutral-700 hover:underline">
                    {subscriber.status === "ACTIVE" ? "Berhenti berlangganan" : "Aktifkan kembali"}
                  </button>
                </form>
                <form action={deleteNewsletterSubscriberAction}>
                  <input type="hidden" name="id" value={subscriber.id} />
                  <button type="submit" className="text-xs text-red-700 hover:underline">
                    Hapus
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={listHref(status, page - 1)} className="text-neutral-700 hover:underline">
              ← Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-neutral-500">
            Halaman {page} dari {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={listHref(status, page + 1)} className="text-neutral-700 hover:underline">
              Berikutnya →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
