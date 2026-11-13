import { randomBytes } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

import { hashPassword } from "../src/lib/password.ts";

/**
 * Modul Treatments & Packages lewat browser: kategori, treatment, add-on, dan
 * package dibuat dari admin, lalu dicek di halaman Menu (desain asli) dan
 * Treatments. Berjalan di proyek "admin-flows" (lihat playwright.config.ts)
 * karena mengubah katalog yang dibaca test lain. Data uji dihapus di akhir.
 */

loadEnv({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
let prisma: PrismaClient | null = null;
function db(): PrismaClient {
  prisma ??= new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema: process.env.DATABASE_SCHEMA || "public" }) });
  return prisma;
}

const tag = randomBytes(3).toString("hex");
const S = `e2e-${tag}`;
const N = `E2E ${tag}`;
const EMAIL = `${S}-katalog@contoh.test`;
const PASSWORD = "kata-sandi-uji-katalog-123";

const ITEM = {
  category: { name: `${N} Kategori`, slug: `${S}-kategori`, slugNew: `${S}-kategori-baru` },
  treatment: { name: `${N} Hot Stone`, slug: `${S}-hot-stone`, tagline: `${N} batu hangat` },
  addon: { name: `${N} Lulur`, slug: `${S}-lulur` },
  pack: { name: `${N} Ritual`, slug: `${S}-ritual`, subtitle: `${N} subjudul paket` },
};

// Server action menulis ke Supabase dalam transaksi; beri waktu lebih dari
// batas bawaan expect (5 detik) sebelum redirect dianggap gagal.
const SAVE_TIMEOUT = 15_000;

test.describe.configure({ mode: "serial", timeout: 180_000 });

test.beforeEach(() => {
  test.skip(!connectionString, "DATABASE_URL tidak tersedia");
});

test.beforeAll(async () => {
  if (!connectionString) return;
  await db().adminUser.create({
    data: {
      email: EMAIL,
      name: "Admin Uji Katalog",
      role: "EDITOR",
      passwordHash: await hashPassword(PASSWORD),
    },
  });
});

test.afterAll(async () => {
  if (!connectionString) return;
  await db().package.deleteMany({ where: { slug: { startsWith: S } } });
  await db().treatment.deleteMany({ where: { slug: { startsWith: S } } });
  await db().treatmentCategory.deleteMany({ where: { slug: { startsWith: S } } });
  await db().redirect.deleteMany({ where: { fromPath: { contains: S } } });
  await db().adminUser.deleteMany({ where: { email: EMAIL } });
  await prisma?.$disconnect();
});

async function login(page: Page) {
  await page.goto("/admin/login?next=/admin/treatments");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/admin/treatments", { timeout: SAVE_TIMEOUT });
}

async function saveAndExpect(page: Page, button: string, urlPath: string) {
  await page.getByRole("button", { name: button, exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === urlPath && url.searchParams.has("saved"), { timeout: SAVE_TIMEOUT });
}

test("CRUD kategori, treatment, add-on, dan package tampil di halaman Menu", async ({
  page,
  request,
}) => {
  await login(page);

  await test.step("buat kategori", async () => {
    await page.goto("/admin/treatments/categories/new");
    await page.getByLabel("Nama", { exact: true }).fill(ITEM.category.name);
    await page.getByLabel("Slug", { exact: true }).fill(ITEM.category.slug);
    await saveAndExpect(page, "Simpan", "/admin/treatments/categories");
    await expect(page.getByRole("link", { name: ITEM.category.name })).toBeVisible();
  });

  await test.step("buat treatment dengan label New", async () => {
    await page.goto("/admin/treatments/new");
    await page.getByLabel("Nama", { exact: true }).fill(ITEM.treatment.name);
    await page.getByLabel("Slug", { exact: true }).fill(ITEM.treatment.slug);
    await page.getByLabel("Kategori").selectOption({ label: ITEM.category.name });
    await page.getByLabel("Tagline").fill(ITEM.treatment.tagline);
    await page.getByLabel("Deskripsi", { exact: true }).fill("Pijat dengan batu hangat.");
    await page.getByLabel("Label durasi baris 1").fill("60 min");
    await page.getByLabel("Menit baris 1").fill("60");
    await page.getByLabel("Harga baris 1").fill("400000");
    await page.getByLabel("Tandai sebagai New").check();
    await saveAndExpect(page, "Simpan", "/admin/treatments");
  });

  await test.step("buat add-on di section Body", async () => {
    await page.goto("/admin/treatments/new?kind=addon");
    await expect(page.getByRole("heading", { name: "Tambah add-on" })).toBeVisible();
    await page.getByLabel("Nama", { exact: true }).fill(ITEM.addon.name);
    await page.getByLabel("Slug", { exact: true }).fill(ITEM.addon.slug);
    await page.getByLabel("Letak di halaman Menu").selectOption("BODY");
    await page.getByLabel("Deskripsi", { exact: true }).fill("Lulur tradisional.");
    await page.getByLabel("Label durasi baris 1").fill("15 min");
    await page.getByLabel("Menit baris 1").fill("15");
    await page.getByLabel("Harga baris 1").fill("90000");
    await saveAndExpect(page, "Simpan", "/admin/treatments/addons");
    await expect(page.getByRole("link", { name: ITEM.addon.name })).toBeVisible();
  });

  await test.step("buat package", async () => {
    await page.goto("/admin/treatments/packages/new");
    await page.getByLabel("Nama", { exact: true }).fill(ITEM.pack.name);
    await page.getByLabel("Slug", { exact: true }).fill(ITEM.pack.slug);
    await page.getByLabel("Subjudul").fill(ITEM.pack.subtitle);
    await page.getByLabel("Harga (Rp)").fill("700000");
    await page.getByLabel("Teks durasi").fill("1 hour");
    await page.getByLabel("Label baris 1").fill("Massage");
    await page.getByLabel("Menit baris 1").fill("60");
    await page.getByLabel("Tandai sebagai New").check();
    // Paket uji ditaruh paling akhir agar urutan paket asli tidak terganggu.
    await page.getByLabel("Urutan tampil").fill("999");
    await saveAndExpect(page, "Simpan", "/admin/treatments/packages");
  });

  await test.step("halaman Menu & Treatments menampilkan data admin", async () => {
    await page.goto("/menu");
    const massage = page.locator("#massage");
    await expect(massage.getByText(ITEM.treatment.name)).toBeVisible();
    await expect(massage.getByText(ITEM.treatment.tagline)).toBeVisible();
    await expect(massage.locator(`a[href="/menu/${ITEM.treatment.slug}"]`)).toContainText("400k");

    const body = page.locator("#body");
    await expect(body.getByText(ITEM.addon.name)).toBeVisible();
    await expect(body).toContainText("90k");

    const packs = page.locator("#packages");
    const card = packs.locator(`a[href="/menu/${ITEM.pack.slug}"]`);
    await expect(card).toContainText(ITEM.pack.subtitle);
    await expect(card).toContainText("700k");
    await expect(card).toContainText("Massage 60");

    // Data asli tetap ada.
    await expect(packs.getByText("Samådhåna")).toBeVisible();
    await expect(massage.getByText("Chair Reflexology")).toBeVisible();

    // Halaman detail untuk konten yang dibuat setelah build tidak boleh 404.
    const detailPages = [
      `/treatments/${ITEM.category.slug}`,
      `/treatments/${ITEM.category.slug}/${ITEM.treatment.slug}`,
      `/menu/${ITEM.treatment.slug}`,
      `/treatments/packages/${ITEM.pack.slug}`,
      `/menu/${ITEM.pack.slug}`,
    ];
    for (const path of detailPages) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      const expected = path.includes(ITEM.pack.slug) ? ITEM.pack.name : ITEM.treatment.name;
      await expect(page.getByRole("heading", { name: expected }).first(), path).toBeVisible();
    }
    await page.goto(`/menu/${ITEM.treatment.slug}`);
    await expect(page.getByText(ITEM.treatment.tagline)).toBeVisible();
  });

  await test.step("sembunyikan treatment → hilang dari Menu", async () => {
    await page.goto("/admin/treatments");
    await page.getByRole("link", { name: ITEM.treatment.name }).click();
    await page.getByLabel("Tampilkan di website").uncheck();
    await saveAndExpect(page, "Simpan", "/admin/treatments");
    await page.goto("/menu");
    await expect(page.locator("#massage").getByText(ITEM.treatment.name)).toHaveCount(0);
  });

  await test.step("kategori berisi tidak bisa dihapus; ganti slug → 301", async () => {
    await page.goto("/admin/treatments/categories");
    await page.getByRole("link", { name: ITEM.category.name }).click();
    await expect(page.getByText("belum bisa dihapus")).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus kategori ini" })).toHaveCount(0);

    await page.getByLabel("Slug", { exact: true }).fill(ITEM.category.slugNew);
    await expect(page.getByText("akan dialihkan permanen (301)")).toBeVisible();
    await saveAndExpect(page, "Simpan", "/admin/treatments/categories");

    // Proxy membaca redirect dari cache berumur 1 detik di server uji.
    await page.waitForTimeout(1300);
    const res = await request.get(`/treatments/${ITEM.category.slug}`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers().location).toContain(`/treatments/${ITEM.category.slugNew}`);
  });
});

test("URL lama All Day Spa dialihkan ke halaman Packages", async ({ request }) => {
  const res = await request.get("/treatments/all-day-spa/samadhana", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers().location).toContain("/treatments/packages/samadhana");

  const index = await request.get("/treatments/all-day-spa", { maxRedirects: 0 });
  expect(index.status()).toBe(301);
  expect(index.headers().location).toContain("/treatments/packages");
});
