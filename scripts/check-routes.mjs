#!/usr/bin/env node
/**
 * Memeriksa invariants halaman route:
 *  1. Setiap `page.tsx` di `src/app/**` (kecuali `admin/login`) memuat
 *     `<Navigation`, `<main`, dan `<Footer` (aturan `.opencode/plugins/kama-guardrails.js`).
 *  2. Semua route dalam sitemap kontrak punya folder halaman yang sesuai.
 *
 * Jalankan: node scripts/check-routes.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const APP_DIR = "src/app";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === "page.tsx") out.push(full);
  }
  return out;
}

const PAGES = walk(APP_DIR);
const problems = [];

for (const file of PAGES) {
  const source = readFileSync(file, "utf8");
  const rel = relative(APP_DIR, file);
  // Halaman admin memakai layout dashboard sendiri, bukan Navigation/Footer publik.
  if (rel.startsWith(join("admin", ""))) continue;

  // Rute dinamis memakai `<DeferredNavigation />` (Navigation di dalam
  // Suspense) supaya shell-nya tetap bisa di-prerender.
  const hasNav =
    source.includes("<Navigation") || source.includes("<DeferredNavigation");
  if (!hasNav) {
    problems.push(`${rel}: tidak memuat <Navigation`);
  }

  for (const needle of ["<main", "<Footer"]) {
    if (!source.includes(needle)) {
      problems.push(`${rel}: tidak memuat ${needle}`);
    }
  }
}

// Route publik dari sitemap kontrak.
const REQUIRED_ROUTES = [
  "",
  "contact",
  "corporate",
  "membership",
  "menu",
  "privacy-policy",
  "terms-conditions",
  "our-story",
  "our-story/journal",
  "treatments",
  "treatments/packages",
  "retail",
  "gallery",
  "events",
  "events/collaborations",
  "promos",
  "promos/membership",
  "gift-card",
  "corporate-wellness",
  "admin",
  "admin/login",
  "admin/treatments",
  "admin/treatments/packages",
  "admin/treatments/prices",
  "admin/gallery",
  "admin/promos",
  "admin/gift-card",
  "admin/membership",
  "admin/journal",
  "admin/events",
  "admin/retail",
  "admin/corporate",
  "admin/corporate/inquiries",
  "admin/homepage",
  "admin/our-story",
  "admin/menu",
  "admin/settings/contact",
  "admin/settings/whatsapp",
  "admin/seo",
  "admin/users",
];

const missing = REQUIRED_ROUTES.filter(
  (route) => !existsSync(join(APP_DIR, route, "page.tsx")),
);

console.log(`Halaman ditemukan: ${PAGES.length}`);
if (missing.length) {
  console.log(`\nRoute belum ada (${missing.length}):`);
  for (const route of missing) console.log(`  - /${route}`);
}
if (problems.length) {
  console.log(`\nInvariant gagal (${problems.length}):`);
  for (const p of problems) console.log(`  - ${p}`);
}
if (!missing.length && !problems.length) {
  console.log("\nSemua route wajib ada dan semua halaman memenuhi invariant.");
}
process.exit(missing.length || problems.length ? 1 : 0);
