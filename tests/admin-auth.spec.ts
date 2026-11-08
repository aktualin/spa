import { expect, test } from "@playwright/test";

/**
 * Guard area admin yang bisa diuji tanpa akun sungguhan (PLAN-9: AUTH-02,
 * AUTH-03, AUTH-12, AUTH-13, SEC-05/06). Login berhasil, lockout, dan ganti
 * password butuh akun uji di database terpisah — belum dijalankan di sini.
 */

test("AUTH-12: halaman admin tanpa login dialihkan ke login dengan next", async ({
  page,
}) => {
  await page.goto("/admin/treatments");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Ftreatments$/);
  await expect(page.getByRole("heading", { name: "Dashboard Admin" })).toBeVisible();
});

test("AUTH-13: cookie sesi palsu diperlakukan seperti belum login", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    {
      name: "kama_admin_session",
      value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4Iiwicm9sZSI6IkFETUlOIiwic3YiOjB9.palsu",
      url: baseURL!,
    },
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("halaman login terpisah dari frontend publik dan tidak diindeks", async ({
  page,
}) => {
  await page.goto("/admin/login");
  // Navigasi, footer, dan tombol WhatsApp situs publik tidak tampil.
  await expect(page.locator("header nav")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Chat via WhatsApp" })).toBeHidden();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("AUTH-02/03: kredensial salah memberi pesan umum", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(`tidak-ada-${Date.now()}@contoh.test`);
  await page.getByLabel("Kata Sandi").fill("kata-sandi-salah-sekali");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Email atau kata sandi salah.")).toBeVisible();
});

test("API admin tanpa sesi membalas 401 JSON", async ({ request }) => {
  const response = await request.post("/api/admin/upload", {
    multipart: { folder: "uji" },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "Tidak terautentikasi." });
});

test("SEC-06: POST lintas origin ke API admin ditolak 403", async ({
  request,
}) => {
  const response = await request.post("/api/admin/upload", {
    headers: { origin: "https://evil.example" },
    multipart: { folder: "uji" },
  });
  expect(response.status()).toBe(403);
});

// GET, karena POST multipart ke path tak dikenal dianggap Server Action
// tidak valid oleh Next.js (400), bukan 404.
test("route upload lama sudah tidak ada", async ({ request }) => {
  const response = await request.get("/api/upload");
  expect(response.status()).toBe(404);
});

test("tombol WhatsApp publik tetap tampil di halaman publik", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Chat via WhatsApp" }).last()).toBeVisible();
});
