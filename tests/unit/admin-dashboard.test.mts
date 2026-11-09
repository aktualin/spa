import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONTENT_SPOTS,
  dashboardAlerts,
  emptyContentSpots,
  journalStatusSegments,
  monthBuckets,
  monthlyTrend,
  PROMO_ENDING_SOON_DAYS,
  promoEndingSoonRange,
  type DashboardInput,
} from "../../src/lib/domain/admin-dashboard.ts";

const SEHAT: DashboardInput = {
  inquiriesNew: 0,
  journalScheduled: 0,
  journalOverdue: 0,
  promosEndingSoon: 0,
  emptyContent: [],
  backup: "ok",
};

describe("Ringkasan dashboard admin", () => {
  it("tidak ada yang perlu ditindaklanjuti → daftar kosong", () => {
    assert.deepEqual(dashboardAlerts(SEHAT), []);
  });

  it("role tanpa akses backup tidak pernah diberi peringatan backup", () => {
    const alerts = dashboardAlerts({ ...SEHAT, backup: null });
    assert.deepEqual(alerts, []);
  });

  it("backup belum pernah atau terlambat jadi peringatan yang berbeda", () => {
    const never = dashboardAlerts({ ...SEHAT, backup: "never" });
    const stale = dashboardAlerts({ ...SEHAT, backup: "stale" });
    assert.equal(never.length, 1);
    assert.equal(stale.length, 1);
    assert.equal(never[0]!.tone, "attention");
    assert.notEqual(never[0]!.label, stale[0]!.label);
    assert.equal(stale[0]!.href, "/admin/status");
  });

  it("artikel lewat waktu diletakkan paling atas", () => {
    const alerts = dashboardAlerts({
      ...SEHAT,
      journalOverdue: 2,
      inquiriesNew: 5,
      promosEndingSoon: 1,
      backup: "stale",
    });
    assert.equal(alerts[0]!.id, "journal-overdue");
    assert.equal(alerts[0]!.count, 2);
    // Hal mendesak (attention) selalu mendahului yang informatif (info).
    const tones = alerts.map((a) => a.tone);
    assert.deepEqual(tones, [...tones].sort((a, b) => (a === b ? 0 : a === "attention" ? -1 : 1)));
  });

  it("artikel terjadwal yang belum jatuh tempo hanya informatif", () => {
    const alerts = dashboardAlerts({ ...SEHAT, journalScheduled: 3 });
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0]!.id, "journal-scheduled");
    assert.equal(alerts[0]!.tone, "info");
  });

  it("tiap tempat konten kosong jadi satu peringatan yang menunjuk modulnya", () => {
    const spots = emptyContentSpots({ homepageHighlight: 0, branch: 3 });
    assert.ok(spots.some((s) => s.key === "homepageHighlight"));
    assert.ok(!spots.some((s) => s.key === "branch"));

    const alerts = dashboardAlerts({ ...SEHAT, emptyContent: spots });
    assert.equal(alerts.length, spots.length);
    for (const alert of alerts) {
      assert.ok(alert.id.startsWith("empty-"));
      assert.ok(alert.href.startsWith("/admin/"));
    }
  });

  it("hitungan lengkap tanpa nol berarti tidak ada tempat kosong", () => {
    const penuh = Object.fromEntries(CONTENT_SPOTS.map((s) => [s.key, 1]));
    assert.deepEqual(emptyContentSpots(penuh), []);
  });

  it("tempat konten punya key unik dan href di bawah /admin", () => {
    const keys = new Set<string>();
    for (const spot of CONTENT_SPOTS) {
      assert.ok(!keys.has(spot.key), `key ganda: ${spot.key}`);
      keys.add(spot.key);
      assert.ok(spot.href.startsWith("/admin/"), spot.href);
    }
  });

  it("rentang promo akan berakhir mulai sekarang sampai 7 hari ke depan", () => {
    const now = new Date("2026-11-09T10:00:00.000Z");
    const range = promoEndingSoonRange(now);
    assert.equal(range.gte.getTime(), now.getTime());
    assert.equal(
      range.lte.getTime() - now.getTime(),
      PROMO_ENDING_SOON_DAYS * 24 * 60 * 60 * 1000,
    );
  });
});

describe("Grafik dashboard", () => {
  it("enam keranjang bulan terakhir memakai kalender WIB dan urut lama → baru", () => {
    const buckets = monthBuckets(new Date("2026-11-09T10:00:00.000Z"), 6);
    assert.deepEqual(
      buckets.map((bucket) => bucket.key),
      ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"],
    );
    assert.deepEqual(
      buckets.map((bucket) => bucket.label),
      ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov"],
    );
    // 1 November 00:00 WIB = 31 Oktober 17:00 UTC.
    assert.equal(buckets[5]!.start.toISOString(), "2026-10-31T17:00:00.000Z");
    assert.equal(buckets[5]!.end.toISOString(), "2026-11-30T17:00:00.000Z");
  });

  it("batas bulan mengikuti WIB, bukan UTC", () => {
    const buckets = monthBuckets(new Date("2026-11-09T10:00:00.000Z"), 2);
    const trend = monthlyTrend(
      [
        new Date("2026-10-31T16:59:59.000Z"), // 31 Okt 23:59 WIB
        new Date("2026-10-31T17:00:00.000Z"), // 1 Nov 00:00 WIB
      ],
      buckets,
    );
    assert.deepEqual(
      trend.map((point) => point.value),
      [1, 1],
    );
  });

  it("nilai di luar rentang tidak dihitung dan bulan kosong tetap tampil nol", () => {
    const buckets = monthBuckets(new Date("2026-11-09T10:00:00.000Z"), 3);
    const trend = monthlyTrend(
      [
        new Date("2026-10-05T10:00:00.000Z"),
        new Date("2026-10-20T10:00:00.000Z"),
        new Date("2026-01-01T10:00:00.000Z"),
      ],
      buckets,
    );
    assert.deepEqual(
      trend.map((point) => point.value),
      [0, 2, 0],
    );
  });

  it("komposisi status journal selalu tiga bagian dengan porsi total 1", () => {
    const segments = journalStatusSegments({
      PUBLISHED: 6,
      SCHEDULED: 2,
      DRAFT: 2,
    });
    assert.deepEqual(
      segments.map((segment) => segment.label),
      ["Terbit", "Terjadwal", "Draf"],
    );
    assert.equal(
      segments.reduce((sum, segment) => sum + segment.share, 0),
      1,
    );
    assert.equal(segments[0]!.share, 0.6);
  });

  it("journal kosong tidak menghasilkan pembagian nol", () => {
    const segments = journalStatusSegments({
      PUBLISHED: 0,
      SCHEDULED: 0,
      DRAFT: 0,
    });
    for (const segment of segments) {
      assert.equal(segment.value, 0);
      assert.equal(segment.share, 0);
      assert.ok(Number.isFinite(segment.share));
    }
  });
});
