import Link from "next/link";

import type { WHATSAPP_CONTEXTS } from "@/lib/domain/whatsapp-template";

import { seedWhatsAppTemplatesAction } from "../../actions/whatsapp-templates";

/** Nomor tujuan aktif, atau peringatan bila belum diatur. */
export function NumberNotice({ number }: { number: string }) {
  if (number) {
    return (
      <p className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        Destination number: <strong>+{number}</strong> (from Contact &amp; General).
      </p>
    );
  }
  return (
    <p
      role="status"
      className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      The WhatsApp number is not set (or is invalid) in Contact &amp; General.
      All WhatsApp buttons on the site are hidden until a number is filled in.{" "}
      <Link href="/admin/settings/contact" className="font-medium underline">
        Fill in the number in Contact &amp; General
      </Link>
      .
    </p>
  );
}

/** Pemberitahuan hasil seed template bawaan. */
export function SeededNote({ seeded }: { seeded?: string }) {
  if (seeded === undefined) return null;
  return (
    <p
      role="status"
      className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
    >
      {Number(seeded) > 0
        ? `${seeded} built-in templates added.`
        : "All built-in templates already exist."}
    </p>
  );
}

/** Form tambah template bawaan untuk konteks yang belum tersimpan. */
export function SeedMissingForm({
  missing,
}: {
  missing: (typeof WHATSAPP_CONTEXTS)[number][];
}) {
  if (missing.length === 0) return null;
  return (
    <form
      action={seedWhatsAppTemplatesAction}
      className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p>
        Not saved yet: {missing.map((context) => context.label).join(", ")}.
        Until they are saved, the website uses the built-in text.
      </p>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Add built-in templates
      </button>
    </form>
  );
}