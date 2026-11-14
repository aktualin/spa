import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { getCorporateContentForm } from "../actions/corporate";
import { listCorporateItems } from "../actions/corporate-items";
import { PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { ClientsSection } from "./corporate-clients-section";
import { HubCard, secondaryLinkClass } from "./corporate-hub-cards";
import { ProgramsSection, StepsSection } from "./corporate-list-sections";

export const instant = false;

export default async function AdminCorporatePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ saved, content }, { programs, steps, clients }, newInquiries, params] =
    await Promise.all([
      getCorporateContentForm(),
      listCorporateItems(),
      prisma.corporateInquiry.count({ where: { status: "NEW" } }),
      searchParams,
    ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Corporate Wellness"
        subtitle="Konten halaman /corporate, program, langkah kolaborasi, klien, PIC, dan inquiry masuk."
        action={
          <a href="/corporate" target="_blank" rel="noopener noreferrer" className={secondaryLinkClass}>
            Lihat halaman ↗
          </a>
        }
      />

      <StatusBanners saved={params.saved} deleted={params.deleted} />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <HubCard
          href="/admin/corporate/content"
          title="Konten halaman"
          body={
            saved
              ? "Hero, intro, benefit, blok solusi, In-Spa."
              : "Belum pernah disimpan — memakai teks bawaan."
          }
        />
        <HubCard
          href="/admin/corporate/pic"
          title="PIC"
          body={`${content.pic.name} · ${content.pic.phone} · ${content.pic.email}`}
        />
        <HubCard
          href="/admin/corporate/inquiries"
          title="Inquiry masuk"
          body={newInquiries > 0 ? `${newInquiries} inquiry baru belum ditindaklanjuti.` : "Tidak ada inquiry baru."}
          highlight={newInquiries > 0}
        />
      </div>

      <ProgramsSection programs={programs} />
      <StepsSection steps={steps} />
      <ClientsSection clients={clients} />
    </div>
  );
}