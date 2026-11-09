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
  locations,
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
import { staticGiftCard } from "../src/lib/domain/gift-card.ts";
import {
  staticCorporateContent,
  staticCorporatePrograms,
  staticCorporateSteps,
} from "../src/lib/domain/corporate.ts";
import { seedContent } from "./seed-content.mts";

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
  // Kategori dulu: artikel menunjuk barisnya, bukan menulis namanya sendiri.
  // Urutan awal mengikuti kemunculan pertama di data artikel.
  const categoryNames: string[] = [];
  for (const post of journalPosts) {
    const name = post.tag?.trim();
    if (name && !categoryNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      categoryNames.push(name);
    }
  }

  const categoryIdByName = new Map<string, string>();
  for (const [index, name] of categoryNames.entries()) {
    const row = await prisma.journalCategory.upsert({
      where: { slug: slugify(name) },
      create: { slug: slugify(name), name, sortOrder: index },
      // Nama & urutan tidak ditimpa: suntingan admin menang.
      update: {},
      select: { id: true },
    });
    categoryIdByName.set(name.toLowerCase(), row.id);
  }

  for (const post of journalPosts) {
    const categoryId = categoryIdByName.get(post.tag?.trim().toLowerCase() ?? "") ?? null;
    await prisma.journalPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        // Konten penuh belum ada di data statis — admin melengkapinya nanti.
        bodyHtml: `<p>${post.excerpt}</p>`,
        coverUrl: post.image,
        categoryId,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        coverUrl: post.image,
      },
    });
  }
  console.log(
    `✔ ${journalPosts.length} artikel journal, ${categoryNames.length} kategori journal`,
  );
}

async function seedCorporate() {
  const content = staticCorporateContent();

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      heroTitle: content.heroTitle,
      intro: content.intro,
      benefits: content.benefits,
      solutions: content.solutions,
      inSpaItems: content.inSpaItems,
      picName: content.pic.name,
      picEmail: content.pic.email,
      picPhone: content.pic.phone,
    },
    // Tidak menimpa: suntingan admin menang.
    update: {},
  });

  // Program & langkah hanya diisi bila tabelnya benar-benar kosong, supaya
  // baris yang sengaja dihapus admin tidak muncul lagi tiap seed dijalankan.
  const programCount = await prisma.corporateProgram.count();
  if (programCount === 0) {
    await prisma.corporateProgram.createMany({
      data: staticCorporatePrograms().map((item, index) => ({
        name: item.name,
        description: item.description,
        features: item.features,
        isPublished: true,
        sortOrder: index,
      })),
    });
  }

  const stepCount = await prisma.corporateStep.count();
  if (stepCount === 0) {
    await prisma.corporateStep.createMany({
      data: staticCorporateSteps().map((item, index) => ({
        title: item.title,
        body: item.body,
        sortOrder: index,
      })),
    });
  }

  console.log(
    `✔ konten corporate (program: ${programCount === 0 ? "diisi" : "sudah ada"}, langkah: ${stepCount === 0 ? "diisi" : "sudah ada"})`,
  );
}

async function seedGiftCard() {
  const base = staticGiftCard();
  const existing = await prisma.giftCardInfo.findUnique({ where: { id: "singleton" } });
  if (existing) {
    console.log("• gift card dilewati (sudah ada)");
    return;
  }

  await prisma.giftCardInfo.create({
    data: {
      id: "singleton",
      title: base.title,
      subtitle: base.subtitle,
      bodyHtml: base.bodyHtml,
      imageUrl: base.imageUrl,
      whatsappMessage: base.whatsappMessage,
    },
  });
  console.log("✔ konten gift card");
}

async function seedSiteSettings() {
  const [openLabel] = site.hours.split(".").slice(-1);
  const defaults = {
    address: site.address,
    openingHours: [site.hours],
    whatsappNumber: site.phone.replace(/\D/g, ""),
    email: site.email,
    phone: site.phone,
    instagramUrl: site.instagram,
    tiktokUrl: site.tiktok,
  };
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) {
    await prisma.siteSettings.create({
      data: { id: "singleton", ...defaults },
    });
  } else {
    const update: Record<string, unknown> = {};
    if (!existing.address?.trim()) update.address = defaults.address;
    if (existing.openingHours.length === 0) update.openingHours = defaults.openingHours;
    if (!existing.whatsappNumber?.trim()) update.whatsappNumber = defaults.whatsappNumber;
    if (!existing.email?.trim()) update.email = defaults.email;
    if (!existing.phone?.trim()) update.phone = defaults.phone;
    if (!existing.instagramUrl?.trim()) update.instagramUrl = defaults.instagramUrl;
    if (!existing.tiktokUrl?.trim()) update.tiktokUrl = defaults.tiktokUrl;
    if (Object.keys(update).length > 0) {
      await prisma.siteSettings.update({ where: { id: "singleton" }, data: update });
    }
  }
  console.log(`✔ pengaturan situs (jam: ${openLabel.trim()})`);

async function seedPageSeo(prisma: PrismaClient): Promise<void> {
  const routes = [
    { path: "/", title: "KAMA Spa • Wellness Sanctuary di South Jakarta", description: "KAMA Spa adalah wellness sanctuary di jantung South Jakarta. Memadukan teknik penyembuhan tradisional dengan pendekatan wellness modern untuk treatments, massage, dan corporate wellness." },
    { path: "/treatments", title: "Treatments", description: "Seluruh treatment KAMA Spa — massage, body, facial, head & scalp, dan bath ritual, lengkap dengan durasi dan harga." },
    { path: "/treatments/packages", title: "Spa Packages", description: "Paket dan All Day Spa KAMA — rangkaian treatment yang disusun jadi satu ritual lengkap." },
    { path: "/menu", title: "Menu Treatments", description: "KAMA Spa menu — massage, body scrub, face ritual, head & scalp treatment, bath ritual, dan paket All Day Spa." },
    { path: "/promos", title: "Promos", description: "Promo dan penawaran khusus KAMA Spa yang sedang berjalan — termasuk membership dan paket treatment." },
    { path: "/membership", title: "Membership", description: "KAMA Membership — paket keanggotaan dengan essential service bulanan, harga anggota untuk seluruh menu, dan benefit khusus." },
    { path: "/promos/membership", title: "Promo Membership", description: "KAMA Membership — paket keanggotaan dengan essential service bulanan, harga anggota untuk seluruh menu, dan benefit khusus." },
    { path: "/corporate", title: "Corporate Wellness", description: "KAMA Corporate Wellness Solutions — program wellness di kantor, pengalaman wellness tim, dan benefit kesehatan karyawan." },
    { path: "/our-story", title: "Our Story", description: "Filosofi dan nilai KAMA Spa — perawatan tradisional yang dikerjakan tanpa terburu-buru." },
    { path: "/our-story/journal", title: "Journal", description: "Tulisan KAMA Spa tentang perawatan tubuh, ritual, dan kebiasaan istirahat yang baik." },
    { path: "/gallery", title: "Gallery", description: "Foto ruang, ritual, dan detail kecil di KAMA Spa — supaya Anda tahu seperti apa suasananya sebelum datang." },
    { path: "/events", title: "Events", description: "Upcoming events dan program KAMA Spa — personally curated experiences, corporate wellness, dan kolaborasi dengan brand." },
    { path: "/events/collaborations", title: "Kolaborasi", description: "Program wellness KAMA Spa yang pernah dijalankan bersama partner, perusahaan, dan brand — a glimpse of wellness in action." },
    { path: "/retail", title: "KAMA Retail", description: "Produk perawatan KAMA Spa yang bisa dibawa pulang — minyak, scrub, dan perlengkapan ritual di rumah." },
    { path: "/gift-card", title: "Gift Card", description: "KAMA Gift Card — hadiah berupa waktu istirahat, berlaku untuk seluruh treatment dan ritual KAMA Spa." },
  ];
  for (const route of routes) {
    const existing = await prisma.pageSeo.findUnique({ where: { path: route.path } });
    if (!existing) {
      await prisma.pageSeo.create({ data: { path: route.path, title: route.title, description: route.description } });
    } else if (!existing.title?.trim() || !existing.description?.trim()) {
      await prisma.pageSeo.update({ where: { path: route.path }, data: { title: existing.title || route.title, description: existing.description || route.description } });
    }
  }
  console.log(`✔ ${routes.length} entri PageSeo`);
}


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
//
// `title` section banner tetap berupa LABEL ADMIN — frontend menyaringnya
// lewat `isPlaceholderTitle` dan memakai teks bawaannya sendiri. Section yang
// judulnya benar-benar dirender di homepage (whats-new, reviews) diisi teks
// tampil, dan `keepText` menandai bahwa isinya tidak boleh ditimpa saat seed
// dijalankan ulang supaya suntingan admin bertahan.
const HOMEPAGE_SECTIONS: {
  key: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  keepText?: boolean;
}[] = [
  { key: "hero", title: "Hero" },
  { key: "membership-banner", title: "Membership Banner" },
  {
    key: "whats-new",
    title: "What’s New",
    subtitle:
      "We believe authentic beauty reaches far beyond the superficial, through consistent self-care you let the beauty shine both externally and internally.",
    ctaLabel: "Subscribe to Newsletter",
    ctaHref: "#footer",
    keepText: true,
  },
  { key: "reviews", title: "Reviews", keepText: true },
  { key: "brand-intro", title: "Brand Intro" },
  { key: "socials", title: "Gallery Teaser & Instagram" },
  { key: "booking-banner", title: "Booking Banner" },
];

async function seedHomepageSections() {
  for (const [index, section] of HOMEPAGE_SECTIONS.entries()) {
    const { keepText, ...data } = section;
    await prisma.homepageSection.upsert({
      where: { key: section.key },
      create: { ...data, sortOrder: index },
      // Section teks: hanya urutannya yang disinkronkan ulang.
      update: keepText ? { sortOrder: index } : { title: section.title, sortOrder: index },
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

async function seedBranches() {
  // Koordinat sebelumnya hidup di location-map.tsx (COORDS) — tidak ada di
  // data statis, jadi dipindahkan ke sini.
  const coords: Record<string, [number, number]> = {
    "south-jakarta": [-6.2438873, 106.7935745],
    sudirman: [-6.2247181, 106.8106879],
    kebayoran: [-6.2264582, 106.8014745],
  };

  let created = 0;
  for (const [index, loc] of locations.entries()) {
    const [latitude, longitude] = coords[loc.slug] ?? [null, null];
    // Cabang yang sudah ada tidak disentuh sama sekali: seluruh kolom Branch
    // dikelola admin, jadi suntingan dari dashboard tidak pernah tertimpa.
    const before = await prisma.branch.findUnique({ where: { slug: loc.slug } });
    if (before) continue;
    await prisma.branch.create({
      data: {
        slug: loc.slug,
        name: loc.name,
        area: loc.area,
        tag: loc.tag || null,
        address: loc.address,
        openingHours: [loc.hours],
        // Nomor & jam dipakai bersama semua cabang lama; dibiarkan kosong agar
        // mengikuti Kontak & Umum, seperti perilaku data statis lama.
        whatsappNumber: null,
        phone: null,
        email: loc.email,
        mapsEmbedUrl: loc.mapEmbed,
        mapsUrl: loc.mapDirections,
        latitude,
        longitude,
        isPublished: true,
        sortOrder: index,
      },
    });
    created++;
  }
  console.log(`✔ ${created} cabang dari ${locations.length} lokasi statis`);
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
    await seedBranches();
    await seedCorporate();
    await seedGiftCard();
    await seedContent(prisma);
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
