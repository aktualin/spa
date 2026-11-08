import { randomBytes } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

import { hashPassword } from "../src/lib/password.ts";

/**
 * Alur ujung-ke-ujung modul Menu Navigasi lewat browser: login admin, susun
 * menu 3 level (tombol & drag-and-drop), pratinjau, lalu pastikan header,
 * menu mobile, dan footer publik berubah tanpa redeploy. Akun admin, halaman,
 * dan item menu uji dibuat sementara lalu dihapus lagi.
 */

loadEnv({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
let prisma: PrismaClient | null = null;
function db(): PrismaClient {
  prisma ??= new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  return prisma;
}

const P = `E2E ${randomBytes(3).toString("hex")}`;
const slugBase = P.toLowerCase().replace(/\s+/g, "-");
const PAGE_SLUG = `${slugBase}-halaman`;
const PAGE_SLUG_NEW = `${slugBase}-halaman-baru`;
const EMAIL = `${slugBase}@contoh.test`;
const PASSWORD = "kata-sandi-uji-panjang-123";

const L = {
  induk: `${P} Induk`,
  kolom: `${P} Kolom`,
  tujuan: `${P} Tujuan`,
  seret: `${P} Seret`,
  footerGrup: `${P} Grup`,
  footerLink: `${P} Tautan`,
};

let pageId = "";

test.describe.configure({ mode: "serial" });

// Berjalan di proyek "admin-menu" (lihat playwright.config.ts), setelah semua
// test lain, karena mengubah menu yang juga dibaca test header/footer.
test.beforeEach(() => {
  test.skip(!connectionString, "DATABASE_URL tidak tersedia");
});

test.beforeAll(async () => {
  if (!connectionString) return;
  await db().adminUser.create({
    data: {
      email: EMAIL,
      name: "Admin Uji Menu",
      role: "EDITOR",
      passwordHash: await hashPassword(PASSWORD),
    },
  });
  const created = await db().staticPage.create({
    data: {
      slug: PAGE_SLUG,
      title: `${P} Halaman`,
      template: "STANDARD",
      bodyHtml: "<p>Halaman uji menu.</p>",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  pageId = created.id;
});

test.afterAll(async () => {
  if (!connectionString) return;
  // Akar dihapus → sub-menu ikut terhapus (cascade).
  await db().menuItem.deleteMany({ where: { label: { startsWith: P }, parentId: null } });
  await db().menuItem.deleteMany({ where: { label: { startsWith: P } } });
  await db().redirect.deleteMany({ where: { fromPath: { contains: slugBase } } });
  await db().staticPage.deleteMany({ where: { slug: { startsWith: slugBase } } });
  await db().adminUser.deleteMany({ where: { email: EMAIL } });
  await prisma?.$disconnect();
});

async function login(page: Page) {
  await page.goto("/admin/login?next=/admin/menu");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Kata Sandi").fill(PASSWORD);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/admin/menu");
}

function row(page: Page, label: string) {
  return page.locator("div[draggable]").filter({ hasText: label });
}

async function addItem(
  page: Page,
  opener: () => Promise<void>,
  fields: { label: string; type: string; url?: string; page?: boolean; locations?: string[] },
) {
  await opener();
  await page.getByLabel("Label").fill(fields.label);
  await page.getByLabel("Tipe tautan").selectOption({ label: fields.type });
  if (fields.url) await page.getByLabel("Alamat").fill(fields.url);
  if (fields.page) await page.getByLabel("Halaman tujuan").selectOption(pageId);
  if (fields.locations) {
    for (const loc of ["Header", "Mobile", "Footer"]) {
      const box = page.getByRole("checkbox", { name: loc, exact: true });
      if (fields.locations.includes(loc)) await box.check();
      else await box.uncheck();
    }
  }
  await page.getByRole("button", { name: "Tambah", exact: true }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(row(page, fields.label)).toBeVisible();
}

test("membuat menu 3 level lewat tombol, dengan validasi", async ({ page }) => {
  await login(page);

  await addItem(page, () => page.getByRole("button", { name: "+ Tambah menu utama" }).click(), {
    label: L.induk,
    type: "URL internal",
    url: "/treatments",
  });
  await addItem(page, () => row(page, L.induk).getByRole("button", { name: "+ Tambah Sub-menu" }).click(), {
    label: L.kolom,
    type: "Tanpa tautan",
  });
  await addItem(page, () => row(page, L.kolom).getByRole("button", { name: "+ Tambah Sub-menu" }).click(), {
    label: L.tujuan,
    type: "Halaman",
    page: true,
  });

  // Level 3: tidak bisa menambah sub-menu lagi.
  await expect(row(page, L.tujuan).getByRole("button", { name: "+ Tambah Sub-menu" })).toBeDisabled();
  // Item halaman menampilkan URL dari slug halaman.
  await expect(row(page, L.tujuan)).toContainText(`/${PAGE_SLUG}`);

  // URL berbahaya ditolak (pesan langsung di form, dan oleh server).
  await page.getByRole("button", { name: "+ Tambah menu utama" }).click();
  await page.getByLabel("Label").fill(`${P} Jahat`);
  await page.getByLabel("Tipe tautan").selectOption({ label: "URL eksternal" });
  await page.getByLabel("Alamat").fill("javascript:alert(1)");
  await expect(page.getByText("URL eksternal harus diawali https://")).toBeVisible();
  await page.getByRole("button", { name: "Tambah", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "URL eksternal harus diawali" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Batal" }).click();
});

test("header desktop dan menu mobile publik memakai menu dari admin", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("banner").getByRole("button", { name: L.induk });
  await trigger.hover();
  const panel = page.locator("[id^='desktop-group-']").filter({ hasText: L.kolom });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: L.tujuan })).toHaveAttribute("href", `/${PAGE_SLUG}`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: /buka menu/i }).click();
  const drawer = page.locator("#mobile-navigation");
  await drawer.getByRole("button", { name: L.induk }).click();
  await expect(drawer.getByRole("link", { name: L.tujuan })).toHaveAttribute("href", `/${PAGE_SLUG}`);
});

test("slug halaman diubah → tautan menu ikut berubah", async ({ page }) => {
  await login(page);
  await page.goto(`/admin/pages/${pageId}`);
  await page.getByLabel("Slug (alamat URL)").fill(PAGE_SLUG_NEW);
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/pages\?saved=1/);

  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: L.induk }).hover();
  await expect(page.getByRole("link", { name: L.tujuan })).toHaveAttribute(
    "href",
    `/${PAGE_SLUG_NEW}`,
  );
});

test("drag-and-drop dengan pratinjau sebelum disimpan", async ({ page }) => {
  await login(page);
  await addItem(page, () => page.getByRole("button", { name: "+ Tambah menu utama" }).click(), {
    label: L.seret,
    type: "URL internal",
    url: "/contact",
  });

  await row(page, L.seret).dragTo(row(page, L.induk));

  // Belum tersimpan: muncul bar konfirmasi dan pratinjau sudah berubah.
  await expect(page.getByText("Susunan menu berubah")).toBeVisible();
  const preview = page.locator("aside").filter({ hasText: "Pratinjau" });
  const indukPreview = preview.locator("li").filter({ hasText: L.induk }).first();
  await expect(indukPreview.locator("ul").getByText(L.seret)).toBeVisible();

  const before = await db().menuItem.findFirst({ where: { label: L.seret } });
  expect(before?.parentId).toBeNull();

  await page.getByRole("button", { name: "Simpan susunan" }).click();
  // URL sudah ?saved=1 sejak langkah sebelumnya; tanda selesai = bar konfirmasi hilang.
  await expect(page.getByText("Susunan menu berubah")).toHaveCount(0);

  const induk = await db().menuItem.findFirst({ where: { label: L.induk } });
  const after = await db().menuItem.findFirst({ where: { label: L.seret } });
  expect(after?.parentId).toBe(induk?.id);
});

test("footer dan visibilitas", async ({ page }) => {
  await login(page);
  await addItem(page, () => page.getByRole("button", { name: "+ Tambah menu utama" }).click(), {
    label: L.footerGrup,
    type: "Tanpa tautan",
    locations: ["Footer"],
  });
  await addItem(page, () => row(page, L.footerGrup).getByRole("button", { name: "+ Tambah Sub-menu" }).click(), {
    label: L.footerLink,
    type: "URL internal",
    url: "/contact",
  });

  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByText(L.footerGrup)).toBeVisible();
  await expect(footer.getByRole("link", { name: L.footerLink })).toHaveAttribute("href", "/contact");
  // Lokasi footer saja: tidak muncul di header.
  await expect(page.getByRole("banner").getByText(L.footerGrup)).toHaveCount(0);

  await page.goto("/admin/menu");
  await row(page, L.footerLink).getByRole("button", { name: "Ubah" }).click();
  await page.getByLabel("Tampilkan di situs").uncheck();
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(row(page, L.footerLink)).toContainText("Tersembunyi");

  await page.goto("/");
  await expect(page.locator("footer").getByText(L.footerGrup)).toHaveCount(0);
});
