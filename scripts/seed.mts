/**
 * Mengisi database KAMA dari konten statis yang sudah ada di src/data/.
 *
 *   node scripts/seed.mts
 *
 * Idempoten: memakai upsert berdasarkan slug/key, jadi aman dijalankan ulang.
 * Tidak pernah menghapus data — konten yang sudah diedit lewat dashboard
 * akan ditimpa hanya pada field yang diseed, bukan dihapus.
 */
// Harus import pertama: env dimuat sebelum data konten dievaluasi.
import "./load-env.mts";

import "./load-env.mts";
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
import { asset } from "../src/lib/asset-url.ts";
import { buildStaticCatalogSeed } from "../src/lib/domain/catalog-seed.ts";
import { escapeHtml } from "../src/lib/domain/corporate.ts";
import { buildStaticMenuSeed } from "../src/lib/domain/menu-seed.ts";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_TITLE,
  OG_LOCALE,
  SITE_NAME,
  TITLE_TEMPLATE,
} from "../src/lib/domain/seo.ts";
import { slugify } from "../src/lib/domain/slug.ts";
import { WHATSAPP_CONTEXTS } from "../src/lib/domain/whatsapp-template.ts";
import { staticGiftCard } from "../src/lib/domain/gift-card.ts";
import {
  staticCorporateContent,
  staticCorporatePrograms,
  staticCorporateSteps,
} from "../src/lib/domain/corporate.ts";
import { seedContent } from "./seed-content.mts";

loadEnv({ path: ".env", quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema: process.env.DATABASE_SCHEMA || "public" }) });

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
  }

  // URL lama dari halaman /treatments/all-day-spa/* tetap hidup lewat 301 —
  // juga di database baru, karena tautan lama itu sudah tersebar di luar situs.
  {
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
      heroImageUrl: asset("img/kama/corporate/01-corporate-sign.jpg"),
      heroImageAlt: "KAMA Spa — Corporate Wellness Solutions",
      aboutImageUrl: asset("img/kama/corporate/02-massage.jpg"),
      aboutImageAlt: "KAMA Spa corporate wellness session",
      inSpaImageUrl: asset("img/kama/corporate/05-lounge.jpg"),
      inSpaImageAlt: "KAMA Spa lounge with a team enjoying refreshments",
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
    officeWhatsappNumber: site.officeWhatsapp.replace(/\D/g, ""),
    email: site.email,
    phone: site.phone,
    instagramUrl: site.instagram,
    tiktokUrl: site.tiktok,
    logoMarkLightUrl: asset("img/kama/mark-kama-light.png"),
    logoMarkDarkUrl: asset("img/kama/mark-kama-dark.png"),
    logoLockupUrl: asset("img/kama/logo-kama-light.png"),
    brandWordmarkTop: "KAMA",
    brandWordmarkBottom: "SPA",
    brandLogoAlt: "KAMA Spa",
    seoSiteName: SITE_NAME,
    seoDefaultTitle: DEFAULT_TITLE,
    seoDefaultDescription: DEFAULT_DESCRIPTION,
    seoOgDescription: DEFAULT_OG_DESCRIPTION,
    seoOgLocale: OG_LOCALE,
    seoTitleTemplate: TITLE_TEMPLATE,
    seoKeywords: [
      "KAMA Spa",
      "massage Jakarta",
      "spa South Jakarta",
      "day spa",
      "corporate wellness",
      "Sukma Laya",
      "Urip Padma",
    ],
    footerMembershipLearnHref: "/membership",
    footerPrivacyHref: "/privacy-policy",
    footerTermsHref: "/terms-conditions",
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
    if (!existing.officeWhatsappNumber?.trim()) update.officeWhatsappNumber = defaults.officeWhatsappNumber;
    if (!existing.email?.trim()) update.email = defaults.email;
    if (!existing.phone?.trim()) update.phone = defaults.phone;
    if (!existing.instagramUrl?.trim()) update.instagramUrl = defaults.instagramUrl;
    if (!existing.tiktokUrl?.trim()) update.tiktokUrl = defaults.tiktokUrl;
    if (!existing.logoMarkLightUrl?.trim()) update.logoMarkLightUrl = defaults.logoMarkLightUrl;
    if (!existing.logoMarkDarkUrl?.trim()) update.logoMarkDarkUrl = defaults.logoMarkDarkUrl;
    if (!existing.logoLockupUrl?.trim()) update.logoLockupUrl = defaults.logoLockupUrl;
    if (!existing.brandWordmarkTop?.trim()) update.brandWordmarkTop = defaults.brandWordmarkTop;
    if (!existing.brandWordmarkBottom?.trim()) update.brandWordmarkBottom = defaults.brandWordmarkBottom;
    if (!existing.brandLogoAlt?.trim()) update.brandLogoAlt = defaults.brandLogoAlt;
    if (!existing.seoSiteName?.trim()) update.seoSiteName = defaults.seoSiteName;
    if (!existing.seoDefaultTitle?.trim()) update.seoDefaultTitle = defaults.seoDefaultTitle;
    if (!existing.seoDefaultDescription?.trim()) update.seoDefaultDescription = defaults.seoDefaultDescription;
    if (!existing.seoOgDescription?.trim()) update.seoOgDescription = defaults.seoOgDescription;
    if (!existing.seoOgLocale?.trim()) update.seoOgLocale = defaults.seoOgLocale;
    if (!existing.seoTitleTemplate?.trim()) update.seoTitleTemplate = defaults.seoTitleTemplate;
    if (existing.seoKeywords.length === 0) update.seoKeywords = defaults.seoKeywords;
    if (!existing.footerMembershipLearnHref?.trim()) update.footerMembershipLearnHref = defaults.footerMembershipLearnHref;
    if (!existing.footerPrivacyHref?.trim()) update.footerPrivacyHref = defaults.footerPrivacyHref;
    if (!existing.footerTermsHref?.trim()) update.footerTermsHref = defaults.footerTermsHref;
    if (Object.keys(update).length > 0) {
      await prisma.siteSettings.update({ where: { id: "singleton" }, data: update });
    }
  }
  console.log(`✔ pengaturan situs (jam: ${openLabel.trim()})`);

async function seedPageSeo(prisma: PrismaClient): Promise<void> {
  const routes = [
    { path: "/", title: "KAMA Spa • Wellness Sanctuary in South Jakarta", description: "KAMA Spa is a wellness sanctuary in South Jakarta, blending traditional healing with modern wellness across treatments, massage, and corporate wellness." },
    { path: "/treatments", title: "Spa Treatments & Massage in Jakarta", description: "Explore the KAMA Spa treatment collection: traditional massage, body treatments, facials, and head & bath rituals. See duration, benefits, and price for each." },
    { path: "/treatments/packages", title: "Curated Spa Packages in South Jakarta", description: "KAMA Spa curated packages for complete relaxation — massage, body treatments, and rituals combined at a package price that saves more than booking separately." },
    { path: "/menu", title: "Full Spa Menu & Prices in South Jakarta", description: "The complete KAMA Spa menu with durations and prices — from massage, body scrubs, and facials to head therapy, bath rituals, and additional services." },
    { path: "/promos", title: "Latest Spa & Massage Promos in Jakarta", description: "The latest KAMA Spa promotions: treatment discounts, value packages, and special member offers. Book via WhatsApp — promo slots are limited each month." },
    { path: "/membership", title: "Spa Membership Plans in South Jakarta", description: "Become a KAMA Spa member and enjoy member prices, priority booking, and exclusive benefits for your routine care. Explore membership tiers and how to join." },
    { path: "/promos/membership", title: "Special Membership Offers in Jakarta", description: "Special KAMA Spa membership offers — joining deals, tier upgrades, and exclusive member benefits for routine wellness care in South Jakarta." },
    { path: "/corporate", title: "Corporate Wellness Programs in Jakarta", description: "KAMA Spa corporate wellness for companies: on-site massage, employee wellness packages, and brand collaborations. Contact our marketing team for a proposal." },
    { path: "/our-story", title: "The Story & Philosophy Behind KAMA", description: "Discover the journey and philosophy of KAMA Spa — traditional Nusantara healing techniques blended with modern wellness in the heart of South Jakarta." },
    { path: "/our-story/journal", title: "Wellness & Spa Journal from Jakarta", description: "Articles on wellness, self-care, and spa treatments from KAMA Spa: relaxation tips, massage benefits, traditional rituals, and guides to balanced living." },
    { path: "/gallery", title: "Spa Atmosphere Gallery in South Jakarta", description: "Step inside KAMA Spa through our photo gallery — treatment room interiors, ritual details, and the calm atmosphere of our South Jakarta wellness sanctuary." },
    { path: "/events", title: "Wellness Events & Workshops in Jakarta", description: "Join KAMA Spa wellness events and workshops: sound healing, mindfulness classes, and community collaborations. See upcoming dates and register via WhatsApp." },
    { path: "/events/collaborations", title: "Brand Collaborations & Partnerships", description: "KAMA Spa collaborations with brands, communities, and wellness creators — from pop-up events to co-created treatments. Pitch your idea via our marketing team." },
    { path: "/retail", title: "Spa & Wellness Retail Products in Jakarta", description: "Bring the KAMA Spa ritual home: our retail collection of essential oils, body care, and aromatherapy picks for everyday self-care at home." },
    { path: "/gift-card", title: "Buy Spa Gift Cards in South Jakarta", description: "Give the gift of relaxation with a KAMA Spa gift card — flexible amounts for any treatment, valid at every branch, and deliverable digitally." },
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

// Semua konteks (default, treatment, package, promo, gift, membership,
// retail, location, event, office) diisi dari teks bawaan registry. Label &
// pesan tidak ditimpa saat seed diulang — suntingan admin menang.
async function seedWhatsAppTemplates() {
  for (const context of WHATSAPP_CONTEXTS) {
    await prisma.whatsAppTemplate.upsert({
      where: { key: context.key },
      create: { key: context.key, label: context.label, message: context.builtIn },
      update: {},
    });
  }
  console.log(`✔ ${WHATSAPP_CONTEXTS.length} template WhatsApp`);
}

// Urutan mengikuti komposisi nyata src/app/page.tsx.
//
// `title` section banner tetap berupa LABEL ADMIN — frontend menyaringnya
// lewat `isPlaceholderTitle` dan memakai teks bawaannya sendiri. Section yang
// judulnya benar-benar dirender di homepage (whats-new) diisi teks tampil,
// dan `keepText` menandai bahwa isinya tidak boleh ditimpa saat seed
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
    keepText: true,
  },
  { key: "brand-intro", title: "Brand Intro" },
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
          highlightImageUrl: item.highlightImageUrl,
          highlightLabel: item.highlightLabel,
          highlightHref: item.highlightHref,
          highlightBadge: item.highlightBadge,
          highlightEyebrow: item.highlightEyebrow,
          parentId: item.parentKey ? idByKey.get(item.parentKey) : null,
        },
        select: { id: true },
      });
      idByKey.set(item.key, created.id);
    }
    // Puluhan insert berurutan ke database di region lain melewati batas
    // default 5 detik transaksi interaktif.
  }, { timeout: 60_000, maxWait: 10_000 });
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
