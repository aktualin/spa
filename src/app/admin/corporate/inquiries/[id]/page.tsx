import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { deleteInquiryAction, getCorporateInquiry } from "../../../actions/corporate";
import { ConfirmDeleteButton } from "../../../promos/_kit/form-ui";
import { formatWibDateTime } from "../../../promos/_kit/schema";
import { StatusBanners } from "../../../promos/_kit/list-ui";
import { InquiryDetails, InquiryEmailSection } from "../inquiry-detail-parts";
import { InquiryStatusForm } from "../inquiry-status-form";
import { InquiryStatusBadge } from "../status-badges";

export const instant = false;

export default async function AdminCorporateInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; emailed?: string; emailFailed?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const inquiry = await getCorporateInquiry(id);
  if (!inquiry) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate/inquiries" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar inquiry
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{inquiry.name}</h1>
        <InquiryStatusBadge status={inquiry.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Masuk {formatWibDateTime(inquiry.createdAt)}. Data pribadi (UU PDP) — gunakan hanya untuk
        menindaklanjuti inquiry ini.
      </p>

      <StatusBanners saved={query.saved} />
      {query.emailed ? (
        <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Email notifikasi berhasil dikirim ulang.
        </p>
      ) : null}
      {query.emailFailed ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Email notifikasi gagal dikirim. Lihat keterangan di bawah.
        </p>
      ) : null}

      <InquiryDetails inquiry={inquiry} />
      <InquiryEmailSection inquiry={inquiry} />

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Tindak lanjut</h2>
        <InquiryStatusForm
          inquiryId={inquiry.id}
          status={inquiry.status}
          notes={inquiry.notes ?? ""}
        />
      </section>

      <form action={deleteInquiryAction} className="mt-8 border-t border-neutral-200 pt-4">
        <input type="hidden" name="id" value={inquiry.id} />
        <ConfirmDeleteButton message="Hapus inquiry ini beserta seluruh data pengirimnya? Tindakan ini tidak bisa dibatalkan.">
          Hapus inquiry (spam / permintaan penghapusan data)
        </ConfirmDeleteButton>
      </form>
    </div>
  );
}