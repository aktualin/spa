import { expect, test } from "@playwright/test";

// SEO-12: /[slug] merender notFound() setelah shell terkirim (soft-404);
// proxy memastikan status HTTP-nya benar-benar 404.
test("slug halaman yang tidak ada membalas 404 sungguhan", async ({ request }) => {
  const response = await request.get(`/tidak-ada-${Date.now()}`);
  expect(response.status()).toBe(404);
});

test("slug tidak valid (huruf besar) juga 404", async ({ request }) => {
  const response = await request.get("/Halaman-Contoh");
  expect(response.status()).toBe(404);
});

test("route yang sudah ada tidak ikut menjadi 404", async ({ request }) => {
  for (const path of ["/", "/contact", "/treatments", "/gift-card", "/our-story"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
