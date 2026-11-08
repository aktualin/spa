import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { getCorporateContentForm } from "../actions/corporate";
import {
  importDefaultProgramsAction,
  importDefaultStepsAction,
  listCorporateItems,
  moveClientAction,
  moveProgramAction,
  moveStepAction,
} from "../actions/corporate-items";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";

export const instant = false;

const secondaryLinkClass =
  "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50";

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

      {/* ---------- Program ---------- */}
      <Section
        id="program"
        title="Program In-Office"
        description="Kartu program di bagian #in-office (mis. Essential, Signature, Executive)."
        addHref="/admin/corporate/programs/new"
        addLabel="Tambah program"
      >
        {programs.length === 0 ? (
          <EmptyDefaults
            text="Belum ada program di database — halaman publik menampilkan 3 program bawaan (Essential, Signature, Executive)."
            action={importDefaultProgramsAction}
            buttonLabel="Salin program bawaan agar bisa diubah"
          />
        ) : (
          <SortableList>
            {programs.map((program, index) => (
              <Row
                key={program.id}
                id={program.id}
                index={index}
                count={programs.length}
                moveAction={moveProgramAction}
                href={`/admin/corporate/programs/${program.id}`}
                thumb={<Thumb src={program.imageUrl} alt="" />}
                title={program.name}
                badge={program.isPublished ? <Badge tone="green">Tayang</Badge> : <Badge tone="muted">Draf</Badge>}
                meta={`${program.features.length} fitur`}
              />
            ))}
          </SortableList>
        )}
      </Section>

      {/* ---------- Langkah ---------- */}
      <Section
        id="langkah"
        title="Langkah kolaborasi"
        description='Bagian "A Simple 4-Step Collaboration Process" — jumlah langkah di judul mengikuti daftar ini.'
        addHref="/admin/corporate/steps/new"
        addLabel="Tambah langkah"
      >
        {steps.length === 0 ? (
          <EmptyDefaults
            text="Belum ada langkah di database — halaman publik menampilkan 4 langkah bawaan."
            action={importDefaultStepsAction}
            buttonLabel="Salin langkah bawaan agar bisa diubah"
          />
        ) : (
          <SortableList>
            {steps.map((step, index) => (
              <Row
                key={step.id}
                id={step.id}
                index={index}
                count={steps.length}
                moveAction={moveStepAction}
                href={`/admin/corporate/steps/${step.id}`}
                title={`Step ${index + 1} · ${step.title}`}
                meta={step.body ?? ""}
              />
            ))}
          </SortableList>
        )}
      </Section>

      {/* ---------- Klien ---------- */}
      <Section
        id="klien"
        title="Klien & dokumentasi"
        description='Logo klien dan foto kegiatan di bagian "Past Collaborations".'
        addHref="/admin/corporate/clients/new"
        addLabel="Tambah klien"
      >
        {clients.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
            Belum ada klien — halaman publik menampilkan 3 foto kolaborasi bawaan. Setelah klien
            pertama ditambahkan, bagian ini memakai logo & foto dokumentasi klien.
          </p>
        ) : (
          <SortableList>
            {clients.map((client, index) => (
              <Row
                key={client.id}
                id={client.id}
                index={index}
                count={clients.length}
                moveAction={moveClientAction}
                href={`/admin/corporate/clients/${client.id}`}
                thumb={<Thumb src={client.logoUrl} alt="" />}
                title={client.name}
                badge={client.isPublished ? <Badge tone="green">Tayang</Badge> : <Badge tone="muted">Draf</Badge>}
                meta={[`${client.photoUrls.length} foto`, client.websiteUrl].filter(Boolean).join(" · ")}
              />
            ))}
          </SortableList>
        )}
      </Section>
    </div>
  );
}

function HubCard({
  href,
  title,
  body,
  highlight = false,
}: {
  href: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50 ${
        highlight ? "border-amber-300" : "border-neutral-200"
      }`}
    >
      <span className="font-medium text-neutral-900">{title} →</span>
      <span className="break-words text-xs text-neutral-500">{body}</span>
    </Link>
  );
}

function Section({
  id,
  title,
  description,
  addHref,
  addLabel,
  children,
}: {
  id: string;
  title: string;
  description: string;
  addHref: string;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        </div>
        <Link href={addHref} className={primaryLinkClass}>
          {addLabel}
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SortableList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {children}
    </ul>
  );
}

function Row({
  id,
  index,
  count,
  moveAction,
  href,
  thumb,
  title,
  badge,
  meta,
}: {
  id: string;
  index: number;
  count: number;
  moveAction: (formData: FormData) => Promise<void>;
  href: string;
  thumb?: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  meta?: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      {thumb}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href} className="font-medium text-neutral-900 hover:underline">
            {title}
          </Link>
          {badge}
        </div>
        {meta ? <p className="mt-0.5 truncate text-xs text-neutral-500">{meta}</p> : null}
      </div>
      <div className="flex items-center gap-1">
        <form action={moveAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="up" />
          <SmallSubmit title="Naikkan" disabled={index === 0}>
            ↑
          </SmallSubmit>
        </form>
        <form action={moveAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="down" />
          <SmallSubmit title="Turunkan" disabled={index === count - 1}>
            ↓
          </SmallSubmit>
        </form>
        <Link href={href} className="ml-1 text-sm text-neutral-600 hover:underline">
          Ubah
        </Link>
      </div>
    </li>
  );
}

function EmptyDefaults({
  text,
  action,
  buttonLabel,
}: {
  text: string;
  action: () => Promise<void>;
  buttonLabel: string;
}) {
  return (
    <div className="space-y-2 rounded-md border border-dashed border-neutral-300 px-4 py-3">
      <p className="text-sm text-neutral-600">{text}</p>
      <form action={action}>
        <SmallSubmit>{buttonLabel}</SmallSubmit>
      </form>
    </div>
  );
}
