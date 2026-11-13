import { randomBytes } from "node:crypto";

import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

/**
 * Redirect dari tabel `Redirect` diterapkan oleh src/proxy.ts. Data uji
 * ditulis langsung ke database; server uji memakai cache proxy 1 detik
 * (lihat playwright.config.ts), jadi test menunggu sebentar sebelum memeriksa.
 */

loadEnv({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
let prisma: PrismaClient | null = null;

function db(): PrismaClient {
  prisma ??= new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema: process.env.DATABASE_SCHEMA || "public" }) });
  return prisma;
}

test.skip(!connectionString, "DATABASE_URL tidak tersedia; uji redirect butuh database.");

test.afterAll(async () => {
  await prisma?.$disconnect();
});

/** Awalan unik per test dan per project, supaya run paralel tidak bentrok. */
function uniqueSlug(kind: string): string {
  const project = test.info().project.name;
  return `e2e-${kind}-${project}-${Date.now()}-${randomBytes(3).toString("hex")}`;
}

type Row = { fromPath: string; toPath: string; statusCode?: number };

// Harus sama dengan REDIRECT_CACHE_TTL_MS di playwright.config.ts. Bukan 0:
// tanpa cache, setiap request (termasuk prefetch tautan) menanyai database dan
// pooler kewalahan saat test berjalan paralel.
const PROXY_CACHE_TTL_MS = 1000;

function waitForProxyCache() {
  return new Promise((resolve) => setTimeout(resolve, PROXY_CACHE_TTL_MS + 300));
}

async function withRedirects(rows: Row[], run: () => Promise<void>) {
  try {
    await db().redirect.createMany({
      data: rows.map((r) => ({
        fromPath: r.fromPath,
        toPath: r.toPath,
        statusCode: r.statusCode ?? 301,
        source: "manual",
        note: "e2e",
      })),
    });
    await waitForProxyCache();
    await run();
  } finally {
    await db().redirect.deleteMany({
      where: { fromPath: { in: rows.map((r) => r.fromPath) } },
    });
  }
}

test("redirect internal 301 diterapkan", async ({ request }) => {
  const base = uniqueSlug("redirect");
  const from = `/${base}-old`;
  const to = `/${base}-new`;
  await withRedirects([{ fromPath: from, toPath: to }], async () => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers().location, "http://x").pathname).toBe(to);
  });
});

test("status 302 dihormati", async ({ request }) => {
  const base = uniqueSlug("redirect");
  const from = `/${base}-old`;
  const to = `/${base}-new`;
  await withRedirects([{ fromPath: from, toPath: to, statusCode: 302 }], async () => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers().location).toContain(to);
  });
});

test("query string dibawa; query tujuan menang saat bentrok", async ({ request }) => {
  const base = uniqueSlug("redirect");
  const from = `/${base}-old`;
  const to = `/${base}-new`;
  const fromKeep = `/${base}-keep`;
  await withRedirects(
    [
      { fromPath: from, toPath: to },
      { fromPath: fromKeep, toPath: `${to}?ref=target` },
    ],
    async () => {
      const plain = await request.get(`${from}?utm_source=ig&x=1`, { maxRedirects: 0 });
      expect(plain.status()).toBe(301);
      const plainUrl = new URL(plain.headers().location, "http://x");
      expect(plainUrl.pathname).toBe(to);
      expect(plainUrl.searchParams.get("utm_source")).toBe("ig");
      expect(plainUrl.searchParams.get("x")).toBe("1");

      const merged = await request.get(`${fromKeep}?ref=old&utm_source=ig`, {
        maxRedirects: 0,
      });
      const mergedUrl = new URL(merged.headers().location, "http://x");
      expect(mergedUrl.searchParams.getAll("ref")).toEqual(["target"]);
      expect(mergedUrl.searchParams.get("utm_source")).toBe("ig");
    },
  );
});

test("varian garis miring akhir dan huruf besar tetap dialihkan", async ({ request }) => {
  const base = uniqueSlug("redirect");
  const from = `/${base}-old`;
  const to = `/${base}-new`;
  await withRedirects([{ fromPath: from, toPath: to }], async () => {
    for (const variant of [`${from}/`, from.toUpperCase()]) {
      const res = await request.get(variant, { maxRedirects: 0 });
      expect([301, 308], variant).toContain(res.status());
      // Next.js bisa lebih dulu membuang garis miring akhir (308); ikuti sampai 301.
      if (res.status() === 308) {
        const next = await request.get(res.headers().location, { maxRedirects: 0 });
        expect(next.status()).toBe(301);
        expect(next.headers().location).toContain(to);
      } else {
        expect(res.headers().location).toContain(to);
      }
    }
  });
});

test("tujuan eksternal https dipakai apa adanya", async ({ request }) => {
  const from = `/${uniqueSlug("redirect")}-ext`;
  const target = "https://example.com/promo?ref=kama";
  await withRedirects([{ fromPath: from, toPath: target }], async () => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers().location).toBe(target);
  });
});

test("path tanpa redirect tidak dialihkan", async ({ request }) => {
  const res = await request.get(`/${uniqueSlug("redirect")}-none`, { maxRedirects: 0 });
  expect([301, 302]).not.toContain(res.status());
  expect(res.status()).toBe(404);
});

test("path /admin tidak memakai tabel redirect", async ({ request }) => {
  const from = `/admin/${uniqueSlug("redirect")}`;
  await withRedirects([{ fromPath: from, toPath: "/contact" }], async () => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toContain("/admin/login");
  });
});

test("URL lama halaman berpindah ke halaman yang diterbitkan", async ({ request }) => {
  const base = uniqueSlug("page");
  const newSlug = `${base}-new`;
  const oldPath = `/${base}-old`;
  const title = `Halaman Uji ${base}`;
  try {
    await db().staticPage.create({
      data: {
        slug: newSlug,
        title,
        template: "STANDARD",
        bodyHtml: "<p>Konten uji redirect.</p>",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    await withRedirects([{ fromPath: oldPath, toPath: `/${newSlug}` }], async () => {
      const res = await request.get(oldPath);
      expect(res.status()).toBe(200);
      expect(new URL(res.url()).pathname).toBe(`/${newSlug}`);
      expect(await res.text()).toContain(title);
    });
  } finally {
    await db().staticPage.deleteMany({ where: { slug: newSlug } });
  }
});
