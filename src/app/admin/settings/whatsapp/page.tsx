import { WHATSAPP_CONTEXTS, normalizeWaNumber } from "@/lib/domain/whatsapp-template";

import { requirePageAccess } from "../../access";
import {
  getSettingsWhatsAppNumber,
  listWhatsAppTemplateRows,
} from "../../actions/whatsapp-templates";
import { StatusBanner } from "../_components/form-ui";
import { NumberNotice, SeedMissingForm, SeededNote } from "./whatsapp-page-parts";
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

  // Tanpa nomor bawaan: belum diatur → empty state, tombol publik disembunyikan.
  const number = normalizeWaNumber(rawNumber) ?? "";
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const missing = WHATSAPP_CONTEXTS.filter((context) => !byKey.has(context.key));
  const others = rows.filter(
    (row) => !WHATSAPP_CONTEXTS.some((context) => context.key === row.key),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        WhatsApp Message Templates
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        The opening message filled in automatically when a guest presses a
        WhatsApp button (click-to-chat <code>wa.me</code>, no paid API). One
        template per context; placeholders like {"{{treatment}}"} are replaced
        automatically. Custom messages set on a treatment, package, promo, or
        gift card still take priority.
      </p>

      <NumberNotice number={number} />

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        savedText="Template saved. WhatsApp buttons on the website use the new message right away."
        deletedText="Template deleted."
      />
      <SeededNote seeded={params.seeded} />

      <SeedMissingForm missing={missing} />

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
