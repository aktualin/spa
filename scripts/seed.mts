/**
 * Mengisi database KAMA dari konten statis yang sudah ada di src/data/.
 *
 *   node scripts/seed.mts
 *
 * Idempoten: memakai upsert berdasarkan slug/key, jadi aman dijalankan ulang.
 * Tidak pernah menghapus data — konten yang sudah diedit lewat dashboard
 * akan ditimpa hanya pada field yang diseed, bukan dihapus.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

import {
  additionalServices,
  packages,
  site,
  treatments,
  journalPosts,
} from "../src/data/content.ts";
import { membership } from "../src/data/pages.ts";

loadEnv({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** "145k" → 145000, "1.5jt" → 1500000, "650k" → 650000. */
function parsePrice(raw: string): number {
  const cleaned = raw.trim().toLowerCase().replace(/\s|rp/g, "");
  const match = /^([\d.,]+)(k|jt|rb)?$/.exec(cleaned);
  if (!match) return 0;

  const amount = Number.parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(amount)) return 0;

  switch (match[2]) {
    case "k":
    case "rb":
      return Math.round(amount * 1_000);
    case "jt":
      return Math.round(amount * 1_000_000);
    default:
      return Math.round(amount);
  }
}

/** "60 min" → 60, "2 hours" → 120, "2.5 hours" → 150. */
function parseDuration(raw: string): number {
  const cleaned = raw.trim().toLowerCase();
  const hours = /^([\d.]+)\s*hour/.exec(cleaned);
  if (hours) return Math.round(Number.parseFloat(hours[1]) * 60);
  const mins = /^([\d.]+)\s*min/.exec(cleaned);
  if (mins) return Math.round(Number.parseFloat(mins[1]));
  return 0;
}

// Kategori sesuai Lampiran I Bagian B kontrak (bukan taksonomi lama
// "Massage/Body/Face" yang dipakai halaman statis).
const CATEGORIES = [
  { slug: "reflexology", name: "Reflexology", sortOrder: 0 },
  { slug: "body-massage", name: "Body Massage", sortOrder: 1 },
  { slug: "all-day-spa", name: "All Day Spa", sortOrder: 2 },
  { slug: "add-ons", name: "Add-ons", sortOrder: 3 },
] as const;

const REFLEXOLOGY_SLUGS = new Set([
  "chair-reflexology",
  "chair-spa",
  "chair-body-recovery",
]);

// Durasi add-on diambil dari daftar essential services di pages.ts
// (sumbernya sama dengan yang dipakai di halaman Membership).
const ADDON_DURATIONS: Record<string, number> = {
  "Face Ritual": 30,
  "Head & Scalp Treatment": 15,
  "Bath Ritual": 15,
  "Body Mask": 15,
  "Body Scrub": 15,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedCategories() {
  for (const category of CATEGORIES) {
    await prisma.treatmentCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, sortOrder: category.sortOrder },
    });
  }
  console.log(`✔ ${CATEGORIES.length} kategori treatment`);
}

async function categoryId(slug: string): Promise<string> {
  const row = await prisma.treatmentCategory.findUniqueOrThrow({
    where: { slug },
  });
  return row.id;
}

async function upsertTreatment(input: {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  sortOrder: number;
  options: { label: string; durationMin: number; priceIdr: number }[];
}) {
  const treatment = await prisma.treatment.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
    },
    update: {
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
    },
  });

  // Opsi harga diganti utuh supaya tidak menumpuk duplikat saat seed ulang.
  await prisma.treatmentOption.deleteMany({
    where: { treatmentId: treatment.id },
  });
  if (input.options.length > 0) {
    await prisma.treatmentOption.createMany({
      data: input.options.map((option, index) => ({
        ...option,
        treatmentId: treatment.id,
        sortOrder: index,
      })),
    });
  }
}

async function seedTreatments() {
  const reflexologyId = await categoryId("reflexology");
  const bodyMassageId = await categoryId("body-massage");
  const allDaySpaId = await categoryId("all-day-spa");
  const addOnsId = await categoryId("add-ons");

  let reflexOrder = 0;
  let massageOrder = 0;

  for (const treatment of treatments) {
    const isReflexology = REFLEXOLOGY_SLUGS.has(treatment.slug);
    await upsertTreatment({
      slug: treatment.slug,
      name: treatment.name,
      description: treatment.description,
      imageUrl: treatment.image,
      categoryId: isReflexology ? reflexologyId : bodyMassageId,
      sortOrder: isReflexology ? reflexOrder++ : massageOrder++,
      options: treatment.prices.map((price) => ({
        label: price.duration,
        durationMin: parseDuration(price.duration),
        priceIdr: parsePrice(price.price),
      })),
    });
  }

  // Array `packages` di content.ts sebenarnya berisi ritual All Day Spa.
  for (const [index, item] of packages.entries()) {
    await upsertTreatment({
      slug: item.slug,
      name: item.name,
      description: item.description,
      imageUrl: item.image,
      categoryId: allDaySpaId,
      sortOrder: index,
      options: [
        {
          label: item.duration,
          durationMin: parseDuration(item.duration),
          priceIdr: parsePrice(item.price),
        },
      ],
    });
  }

  for (const [index, service] of additionalServices.entries()) {
    await upsertTreatment({
      slug: slugify(service.name),
      name: service.name,
      description: service.description,
      imageUrl: service.image,
      categoryId: addOnsId,
      sortOrder: index,
      options: [
        {
          label: `${ADDON_DURATIONS[service.name] ?? 15} min`,
          durationMin: ADDON_DURATIONS[service.name] ?? 15,
          priceIdr: parsePrice(service.price),
        },
      ],
    });
  }

  const total =
    treatments.length + packages.length + additionalServices.length;
  console.log(
    `✔ ${total} treatment (${treatments.length} reflexology/body massage, ${packages.length} all day spa, ${additionalServices.length} add-ons)`,
  );
}

async function seedMembership() {
  for (const [index, plan] of membership.plans.entries()) {
    const slug = slugify(plan.name);
    await prisma.membershipTier.upsert({
      where: { slug },
      create: {
        slug,
        name: plan.name,
        priceLabel: plan.price,
        billingNote: plan.billed,
        summary: plan.note,
        benefits: plan.features,
        sortOrder: index,
      },
      update: {
        name: plan.name,
        priceLabel: plan.price,
        billingNote: plan.billed,
        summary: plan.note,
        benefits: plan.features,
        sortOrder: index,
      },
    });
  }
  console.log(`✔ ${membership.plans.length} tier membership`);
}

async function seedJournal() {
  for (const post of journalPosts) {
    await prisma.journalPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        // Konten penuh belum ada di data statis — admin melengkapinya nanti.
        bodyHtml: `<p>${post.excerpt}</p>`,
        coverUrl: post.image,
        category: post.tag,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        coverUrl: post.image,
        category: post.tag,
      },
    });
  }
  console.log(`✔ ${journalPosts.length} artikel journal`);
}

async function seedSiteSettings() {
  const [openLabel] = site.hours.split(".").slice(-1);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      address: site.address,
      openingHours: [site.hours],
      whatsappNumber: site.phone.replace(/\D/g, ""),
      email: site.email,
      phone: site.phone,
      instagramUrl: site.instagram,
      tiktokUrl: site.tiktok,
    },
    update: {
      address: site.address,
      openingHours: [site.hours],
      whatsappNumber: site.phone.replace(/\D/g, ""),
      email: site.email,
      phone: site.phone,
      instagramUrl: site.instagram,
      tiktokUrl: site.tiktok,
    },
  });
  console.log(`✔ pengaturan situs (jam: ${openLabel.trim()})`);
}

const WHATSAPP_TEMPLATES = [
  {
    key: "default",
    label: "Reservasi umum",
    message: "Halo kak, saya mau reservasi",
  },
  {
    key: "membership",
    label: "Daftar membership",
    message: "Halo kak, saya mau join member",
  },
  {
    key: "treatment",
    label: "Reservasi treatment tertentu",
    message: "Halo kak, saya mau reservasi {{treatment}}",
  },
  {
    key: "retail",
    label: "Pemesanan produk retail",
    message: "Halo kak, saya mau pesan produk {{product}}",
  },
];

async function seedWhatsAppTemplates() {
  for (const template of WHATSAPP_TEMPLATES) {
    await prisma.whatsAppTemplate.upsert({
      where: { key: template.key },
      create: template,
      update: { label: template.label, message: template.message },
    });
  }
  console.log(`✔ ${WHATSAPP_TEMPLATES.length} template WhatsApp`);
}

// Urutan mengikuti komposisi nyata src/app/page.tsx.
const HOMEPAGE_SECTIONS = [
  { key: "hero", title: "Hero" },
  { key: "membership-banner", title: "Membership Banner" },
  { key: "whats-new", title: "Promo / Event Highlight" },
  { key: "reviews", title: "Reviews" },
  { key: "brand-intro", title: "Brand Intro" },
  { key: "socials", title: "Gallery Teaser & Instagram" },
  { key: "booking-banner", title: "Booking Banner" },
];

async function seedHomepageSections() {
  for (const [index, section] of HOMEPAGE_SECTIONS.entries()) {
    await prisma.homepageSection.upsert({
      where: { key: section.key },
      create: { ...section, sortOrder: index },
      update: { title: section.title, sortOrder: index },
    });
  }
  console.log(`✔ ${HOMEPAGE_SECTIONS.length} section homepage`);
}

try {
  await seedCategories();
  await seedTreatments();
  await seedMembership();
  await seedJournal();
  await seedSiteSettings();
  await seedWhatsAppTemplates();
  await seedHomepageSections();
  console.log("\n✅ Seed selesai.");
} catch (error) {
  console.error("✖ Seed gagal:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
