import { ListPagination } from "../_components/list-pagination";
import { requirePageAccess } from "../access";
import { deleteNewsletterSignupAction, listNewsletterSignups } from "../actions/newsletter";
import { ConfirmDeleteButton } from "../promos/_kit/form-ui";
import { PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";

export const instant = false;

function listHref(page: number): string {
  return page > 1 ? `/admin/newsletter?page=${page}` : "/admin/newsletter";
}

/** Inbox pendaftar newsletter dari form di footer situs. */
export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; page?: string }>;
}) {
  await requirePageAccess("/admin/newsletter");

  const params = await searchParams;
  const { rows, total, page, pageCount } = await listNewsletterSignups({ page: params.page });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Newsletter"
        subtitle={
          <>
            {total} pendaftar dari form newsletter di footer. Data ini memuat informasi
            pribadi (UU PDP) — hanya untuk tim, jangan dibagikan ke luar dashboard.
          </>
        }
      />

      <StatusBanners deleted={params.deleted} deletedLabel="Pendaftar dihapus." />

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada pendaftar. Kiriman dari form newsletter footer akan muncul di sini.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="break-words font-medium text-neutral-900">
                  <a href={`mailto:${row.email}`} className="hover:underline">
                    {row.email}
                  </a>
                  {row.name ? (
                    <span className="font-normal text-neutral-600"> · {row.name}</span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {formatWibDateTime(row.createdAt)}
                  {row.branchSlug ? ` · cabang ${row.branchSlug}` : ""}
                </p>
              </div>
              <form action={deleteNewsletterSignupAction} className="shrink-0">
                <input type="hidden" name="id" value={row.id} />
                <ConfirmDeleteButton message="Hapus pendaftar ini beserta datanya? Tindakan ini tidak bisa dibatalkan.">
                  Hapus
                </ConfirmDeleteButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <ListPagination page={page} pageCount={pageCount} hrefFor={listHref} />
    </div>
  );
}