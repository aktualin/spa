import { resendInquiryEmailAction, type getCorporateInquiry } from "../../actions/corporate";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { EmailStatusBadge } from "./status-badges";

type Inquiry = NonNullable<Awaited<ReturnType<typeof getCorporateInquiry>>>;

/** Data pengirim inquiry (perusahaan, email, telepon, pesan). */
export function InquiryDetails({ inquiry }: { inquiry: Inquiry }) {
  return (
    <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm sm:grid-cols-[9rem_1fr]">
      <dt className="text-neutral-500">Perusahaan</dt>
      <dd className="break-words text-neutral-900">{inquiry.company ?? "—"}</dd>
      <dt className="text-neutral-500">Email</dt>
      <dd className="break-words">
        <a href={`mailto:${inquiry.email}`} className="text-neutral-900 underline">
          {inquiry.email}
        </a>
      </dd>
      <dt className="text-neutral-500">Telepon</dt>
      <dd className="break-words text-neutral-900">{inquiry.phone ?? "—"}</dd>
      <dt className="text-neutral-500">Pesan</dt>
      <dd className="whitespace-pre-wrap break-words text-neutral-900">{inquiry.message}</dd>
    </dl>
  );
}

/** Status email notifikasi ke pihak pertama + tombol kirim ulang. */
export function InquiryEmailSection({ inquiry }: { inquiry: Inquiry }) {
  return (
    <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">Email ke pihak pertama</h2>
        <EmailStatusBadge sentAt={inquiry.emailSentAt} error={inquiry.emailError} />
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        {inquiry.emailSentAt
          ? `Terkirim ${formatWibDateTime(inquiry.emailSentAt)}.`
          : inquiry.emailError
            ? `Gagal: ${inquiry.emailError}`
            : "Belum ada catatan pengiriman (sedang diproses atau server email belum dikonfigurasi)."}
      </p>
      <form action={resendInquiryEmailAction} className="mt-3">
        <input type="hidden" name="id" value={inquiry.id} />
        <SmallSubmit>{inquiry.emailSentAt ? "Kirim ulang email" : "Coba kirim email lagi"}</SmallSubmit>
      </form>
    </section>
  );
}