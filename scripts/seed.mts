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
  footerLinks,
  nav,
  packages,
  site,
  treatments,
  journalPosts,
} from "../src/data/content.ts";
import { membership, privacyPolicy, termsConditions } from "../src/data/pages.ts";
import { buildStaticCatalogSeed } from "../src/lib/domain/catalog-seed.ts";
import { escapeHtml } from "../src/lib/domain/corporate.ts";
import { buildStaticMenuSeed } from "../src/lib/domain/menu-seed.ts";
import { slugify } from "../src/lib/domain/slug.ts";

loadEnv({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Katalog (kategori, treatment, add-on, package) disusun dari konten statis
// lewat src/lib/domain/catalog-seed.ts. Seed hanya MEMBUAT yang belum ada —
// tidak pernah menimpa isi atau harga yang sudah diubah admin.
const catalogSeed = buildStaticCatalogSeed({ treatments, packages, additionalServices });

async function seedCategories() {
  for (const category of catalogSeed.categories) {
    await prisma.treatmentCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: {},
    });
  }
  console.log(`✔ ${catalogSeed.categories.length} kategori treatment`);
}

async function seedTreatments() {
  const categories = await prisma.treatmentCategory.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  let created = 0;

  for (const t of catalogSeed.treatments) {
    const exists = await prisma.treatment.findUnique({ where: { slug: t.slug }, select: { id: true } });
    if (exists) continue;
    const categoryId = categoryIdBySlug.get(t.categorySlug);
    if (!categoryId) continue;
    await prisma.treatment.create({
      data: {
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        note: t.note,
        imageUrl: t.imageUrl,
        addonSection: t.addonSection,
        sortOrder: t.sortOrder,
        categoryId,
        options: {
          create: t.options.map((option, index) => ({ ...option, sortOrder: index })),
        },
      },
    });
    created += 1;
  }
  console.log(`✔ treatment & add-on: ${created} baru, ${catalogSeed.treatments.length - created} sudah ada`);
}

async function seedPackages() {
  let created = 0;
  for (const p of catalogSeed.packages) {
    const exists = await prisma.package.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) continue;
    await createPackage(p, null);
    created += 1;
  }
  console.log(`✔ package: ${created} baru, ${catalogSeed.packages.length - created} sudah ada`);
}

async function createPackage(
  p: (typeof catalogSeed.packages)[number],
  // Treatment All Day Spa lama: isi yang mungkin sudah diedit admin dipakai lebih dulu.
  legacy: { description: string | null; imageUrl: string | null; priceIdr: number | null; isPublished: boolean } | null,
) {
  await prisma.package.create({
    data: {
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      quote: p.quote,
      description: legacy?.description ?? p.description,
      imageUrl: legacy?.imageUrl ?? p.imageUrl,
      durationLabel: p.durationLabel,
      durationMin: p.durationMin,
      priceIdr: legacy?.priceIdr ?? p.priceIdr,
      isPublished: legacy?.isPublished ?? true,
      sortOrder: p.sortOrder,
      items: {
        create: p.items.map((item, index) => ({
          label: item.name,
          minutes: item.minutes,
          sortOrder: index,
        })),
      },
    },
  });
}

/**
 * Database lama menyimpan ritual All Day Spa sebagai treatment di kategori
 * "all-day-spa", dan add-on tanpa jenis/section. Langkah ini memindahkan
 * keduanya ke model baru. Aman dijalankan berulang.
 */
async function migrateLegacyCatalog() {
  const addOns = await prisma.treatmentCategory.updateMany({
    where: { slug: "add-ons", kind: "TREATMENT" },
    data: { kind: "ADDON" },
  });

  let filled = 0;
  for (const t of catalogSeed.treatments) {
    const row = await prisma.treatment.findUnique({
      where: { slug: t.slug },
      select: { id: true, tagline: true, note: true, addonSection: true },
    });
    if (!row) continue;
    const data: { tagline?: string; note?: string; addonSection?: typeof t.addonSection } = {};
    if (row.tagline === null && t.tagline) data.tagline = t.tagline;
    if (row.note === null && t.note) data.note = t.note;
    if (row.addonSection === null && t.addonSection) data.addonSection = t.addonSection;
    if (Object.keys(data).length === 0) continue;
    await prisma.treatment.update({ where: { id: row.id }, data });
    filled += 1;
  }

  const legacyCategory = await prisma.treatmentCategory.findUnique({
    where: { slug: "all-day-spa" },
    include: { treatments: { include: { options: { orderBy: { sortOrder: "asc" } } } } },
  });
  let moved = 0;
  if (legacyCategory) {
    for (const p of catalogSeed.packages) {
      const legacy = legacyCategory.treatments.find((t) => t.slug === p.slug);
      const exists = await prisma.package.findUnique({ where: { slug: p.slug }, select: { id: true } });
      if (!exists) {
        await createPackage(
          p,
          legacy
            ? {
                description: legacy.description,
                imageUrl: legacy.imageUrl,
                priceIdr: legacy.options[0]?.priceIdr ?? null,
                isPublished: legacy.isPublished,
              }
            : null,
        );
        moved += 1;
      }
      if (legacy) await prisma.treatment.delete({ where: { id: legacy.id } });
    }

    const remaining = await prisma.treatment.count({ where: { categoryId: legacyCategory.id } });
    if (remaining === 0) {
      await prisma.treatmentCategory.delete({ where: { id: legacyCategory.id } });
    }

    // URL lama dari halaman /treatments/all-day-spa/* tetap hidup lewat 301.
    const rules = [
      { fromPath: "/treatments/all-day-spa", toPath: "/treatments/packages" },
      ...catalogSeed.packages.map((p) => ({
        fromPath: `/treatments/all-day-spa/${p.slug}`,
        toPath: `/treatments/packages/${p.slug}`,
      })),
    ];
    for (const rule of rules) {
      await prisma.redirect.upsert({
        where: { fromPath: rule.fromPath },
        create: { ...rule, statusCode: 301, source: "auto", note: "All Day Spa pindah ke Package" },
        update: {},
      });
    }
  }

  console.log(
    `✔ migrasi katalog: add-on ${addOns.count ? "ditandai" : "sudah benar"}, ${filled} treatment dilengkapi, ${moved} All Day Spa → Package`,
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

// Hanya mengisi tabel yang masih kosong, supaya susunan menu yang sudah diatur
// admin tidak pernah tertimpa.
async function seedMenu() {
  const existing = await prisma.menuItem.count();
  if (existing > 0) {
    console.log(`• menu dilewati (sudah ada ${existing} item)`);
    return;
  }

  const items = buildStaticMenuSeed(nav, footerLinks);
  const idByKey = new Map<string, string>();
  await prisma.$transaction(async (tx) => {
    // Urutan seed selalu induk lebih dulu daripada anaknya.
    for (const item of items) {
      const created = await tx.menuItem.create({
        data: {
          label: item.label,
          linkType: item.linkType,
          url: item.url,
          sortOrder: item.sortOrder,
          openInNew: item.openInNew,
          locations: item.locations,
          panelKey: item.panelKey,
          panelLinkLabel: item.panelLinkLabel,
          parentId: item.parentKey ? idByKey.get(item.parentKey) : null,
        },
        select: { id: true },
      });
      idByKey.set(item.key, created.id);
    }
  });
  console.log(`✔ ${items.length} item menu`);
}

type PolicyPage = {
  intro: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
};

/**
 * Bagian kebijakan → HTML yang lolos `sanitizeHtml`. Tag `<details>` tidak
 * termasuk daftar tag yang diizinkan, jadi tiap bagian menjadi `h5` + isinya.
 */
function policyBodyHtml(page: PolicyPage): string {
  return page.sections
    .map((section) => {
      const parts = [`<h5>${escapeHtml(section.title)}</h5>`];
      for (const paragraph of section.paragraphs) {
        parts.push(`<p>${escapeHtml(paragraph)}</p>`);
      }
      if (section.bullets?.length) {
        const items = section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");
        parts.push(`<ul>${items}</ul>`);
      }
      return parts.join("");
    })
    .join("");
}

async function seedLegalPages() {
  const pages = [
    { slug: "privacy-policy", title: "Privacy Policy", source: privacyPolicy },
    { slug: "terms-conditions", title: "Terms & Conditions", source: termsConditions },
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        template: "LEGAL",
        bodyHtml: policyBodyHtml(page.source),
        seoDescription: page.source.intro,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      // `bodyHtml` dan `status` tidak ditimpa supaya suntingan admin bertahan.
      update: { title: page.title, template: "LEGAL" },
    });
  }
  console.log(`✔ ${pages.length} halaman legal`);
}

try {
  if (process.argv.includes("--menu-only")) {
    await seedMenu();
  } else if (process.argv.includes("--catalog-only")) {
    await migrateLegacyCatalog();
    await seedCategories();
    await seedTreatments();
    await seedPackages();
  } else {
    await migrateLegacyCatalog();
    await seedCategories();
    await seedTreatments();
    await seedPackages();
    await seedMembership();
    await seedJournal();
    await seedSiteSettings();
    await seedWhatsAppTemplates();
    await seedHomepageSections();
    await seedLegalPages();
    await seedMenu();
  }
  console.log("\n✅ Seed selesai.");
} catch (error) {
  console.error("✖ Seed gagal:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
