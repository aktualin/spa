import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  VISITOR_COOKIE,
  isBotUserAgent,
  trackablePageView,
  trackablePath,
} from "../../src/lib/domain/page-view.ts";
import {
  averagePagesPerVisitor,
  dailyTrafficSeries,
  dayBuckets,
  dayKeyWib,
  pageViewShare,
  parseTrafficPeriod,
  totalViews,
} from "../../src/lib/domain/traffic.ts";

function headers(values: Record<string, string> = {}) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

describe("Keranjang hari analitik pengunjung", () => {
  it("tiga hari terakhir memakai kalender WIB dan urut lama → baru", () => {
    const buckets = dayBuckets(new Date("2026-11-09T10:00:00.000Z"), 3);
    assert.deepEqual(
      buckets.map((bucket) => bucket.key),
      ["2026-11-07", "2026-11-08", "2026-11-09"],
    );
    assert.deepEqual(
      buckets.map((bucket) => bucket.label),
      ["7 Nov", "8 Nov", "9 Nov"],
    );
    // 9 November 00:00 WIB = 8 November 17:00 UTC.
    assert.equal(buckets[2]!.start.toISOString(), "2026-11-08T17:00:00.000Z");
    assert.equal(buckets[2]!.end.toISOString(), "2026-11-09T17:00:00.000Z");
  });

  it("batas hari mengikuti WIB, bukan UTC", () => {
    // 9 Nov 23:59 WIB (16:59 UTC) masih tanggal 9.
    assert.equal(
      dayKeyWib(new Date("2026-11-09T16:59:59.000Z")),
      "2026-11-09",
    );
    // 10 Nov 00:00 WIB (9 Nov 17:00 UTC) sudah tanggal 10.
    assert.equal(
      dayKeyWib(new Date("2026-11-09T17:00:00.000Z")),
      "2026-11-10",
    );
    const buckets = dayBuckets(new Date("2026-11-09T17:00:00.000Z"), 1);
    assert.equal(buckets[0]!.key, "2026-11-10");
  });

  it("periode hanya menerima 7, 30, atau 90 hari", () => {
    assert.equal(parseTrafficPeriod("7"), 7);
    assert.equal(parseTrafficPeriod("90"), 90);
    assert.equal(parseTrafficPeriod("14"), 30);
    assert.equal(parseTrafficPeriod(undefined), 30);
    assert.equal(parseTrafficPeriod("abc"), 30);
  });

  it("hari tanpa data tetap muncul sebagai nol di seri grafik", () => {
    const buckets = dayBuckets(new Date("2026-11-09T10:00:00.000Z"), 3);
    const rows = [
      { day: "2026-11-08", views: 5, visitors: 3 },
      { day: "2026-11-09", views: 2, visitors: 2 },
      { day: "2026-10-01", views: 9, visitors: 9 },
    ];
    assert.deepEqual(
      dailyTrafficSeries(rows, buckets, "visitors").map((point) => point.value),
      [0, 3, 2],
    );
    assert.deepEqual(
      dailyTrafficSeries(rows, buckets, "views").map((point) => point.value),
      [0, 5, 2],
    );
  });

  it("total, rata-rata, dan porsi aman saat data kosong", () => {
    assert.equal(totalViews([{ day: "2026-11-09", views: 4, visitors: 2 }]), 4);
    assert.equal(averagePagesPerVisitor(10, 4), 2.5);
    assert.equal(averagePagesPerVisitor(0, 0), 0);
    assert.equal(pageViewShare(1, 4), 0.25);
    assert.equal(pageViewShare(1, 0), 0);
  });
});

describe("Aturan pencatatan tampilan halaman", () => {
  it("hanya path publik yang dicatat dan dinormalisasi", () => {
    assert.equal(trackablePath("/"), "/");
    assert.equal(trackablePath("/treatments/"), "/treatments");
    assert.equal(trackablePath("//treatments//spa"), "/treatments/spa");
    assert.equal(trackablePath("/hal%61man"), "/halaman");
    assert.equal(trackablePath("/our-story/journal/slug"), "/our-story/journal/slug");
  });

  it("admin, API, aset, dan route metadata tidak dicatat", () => {
    for (const path of [
      "/admin",
      "/admin/users",
      "/api/content/treatments",
      "/_next/static/chunk.js",
      "/img/foto.jpg",
      "/fonts/regola.woff2",
      "/sitemap.xml",
      "/favicon.ico",
      "/opengraph-image",
      "/our-story/opengraph-image",
      "tanpa-garis-miring",
    ]) {
      assert.equal(trackablePath(path), null, path);
    }
  });

  it("mengenali bot/crawler tanpa menyaring browser biasa", () => {
    assert.equal(
      isBotUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
      ),
      false,
    );
    assert.equal(isBotUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
    assert.equal(isBotUserAgent("WhatsApp/2.23.20.0"), true);
    assert.equal(isBotUserAgent("curl/8.4.0"), true);
    assert.equal(isBotUserAgent(""), false);
  });

  it("hanya muat penuh dokumen publik yang dicatat di proxy", () => {
    const base = {
      method: "GET",
      pathname: "/treatments",
      hasAdminSession: false,
    };
    const document = {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "sec-fetch-dest": "document",
    };

    assert.equal(
      trackablePageView({ ...base, headers: headers(document) }),
      "/treatments",
    );
    // Browser lama tanpa Sec-Fetch-Dest tetap dikenali dari Accept.
    assert.equal(
      trackablePageView({ ...base, headers: headers({ accept: "text/html" }) }),
      "/treatments",
    );
    // Request RSC/prefetch: Accept */* dan tanpa dokumen.
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ rsc: "1", "sec-fetch-dest": "empty" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ "next-router-prefetch": "1" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ ...document, purpose: "prefetch" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ ...document, "sec-purpose": "prefetch" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ ...document, "sec-fetch-dest": "image" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers({ ...document, "user-agent": "Googlebot/2.1" }),
      }),
      null,
    );
    assert.equal(
      trackablePageView({
        ...base,
        headers: headers(document),
        hasAdminSession: true,
      }),
      null,
    );
    assert.equal(
      trackablePageView({ ...base, method: "POST", headers: headers(document) }),
      null,
    );
  });

  it("nama cookie pengunjung tidak memakai data pribadi", () => {
    assert.equal(VISITOR_COOKIE, "kama_visitor_id");
  });
});
