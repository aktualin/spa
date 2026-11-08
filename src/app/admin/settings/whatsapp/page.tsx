import { WHATSAPP_CONTEXTS, normalizeWaNumber } from "@/lib/domain/whatsapp-template";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

import { requirePageAccess } from "../../access";
import {
  getSettingsWhatsAppNumber,
  listWhatsAppTemplateRows,
  seedWhatsAppTemplatesAction,
} from "../../actions/whatsapp-templates";
import { StatusBanner } from "../_components/form-ui";
import { WhatsAppTemplateList } from "./whatsapp-template-list";

export const instant = false;

export default async function AdminWhatsAppSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; seeded?: string }>;
}) {
  await requirePageAccess("/admin/settings/whatsapp");

  const [rows, rawNumber, params] = await Promise.all([
    listWhatsAppTemplateRows(),
    getSettingsWhatsAppNumber(),
    searchParams,
  ]);

  const settingsNumber = normalizeWaNumber(rawNumber);
  const number = settingsNumber ?? WHATSAPP_NUMBER;
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const missing = WHATSAPP_CONTEXTS.filter((context) => !byKey.has(context.key));
  const others = rows.filter(
    (row) => !WHATSAPP_CONTEXTS.some((context) => context.key === row.key),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Template Pesan WhatsApp
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Pesan awal yang otomatis terisi saat tamu menekan tombol WhatsApp
        (click-to-chat <code>wa.me</code>, tanpa API berbayar). Satu template
        per konteks; placeholder seperti {"{{treatment}}"} diganti otomatis.
        Pesan khusus yang diisi di treatment, paket, promo, atau gift card
        tetap diutamakan.
      </p>

      <p className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        Nomor tujuan: <strong>+{number}</strong>{" "}
        {settingsNumber
          ? "(dari Kontak & Umum)."
          : "(nomor bawaan — nomor di Kontak & Umum kosong atau tidak valid)."}
      </p>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        savedText="Template disimpan. Tombol WhatsApp di website langsung memakai pesan baru."
        deletedText="Template dihapus."
      />
      {params.seeded !== undefined ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          {Number(params.seeded) > 0
            ? `${params.seeded} template bawaan ditambahkan.`
            : "Semua template bawaan sudah ada."}
        </p>
      ) : null}

      {missing.length > 0 ? (
        <form
          action={seedWhatsAppTemplatesAction}
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p>
            Belum tersimpan: {missing.map((context) => context.label).join(", ")}.
            Selama belum disimpan, website memakai teks bawaan.
          </p>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Tambahkan template bawaan
          </button>
        </form>
      ) : null}

      <div className="mt-6">
        <WhatsAppTemplateList
          templates={WHATSAPP_CONTEXTS.map((context) => ({
            key: context.key,
            message: byKey.get(context.key)?.message ?? null,
          }))}
          others={others.map((row) => ({
            id: row.id,
            key: row.key,
            label: row.label,
            message: row.message,
          }))}
          number={number}
        />
      </div>
    </div>
  );
}
