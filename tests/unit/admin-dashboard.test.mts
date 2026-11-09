import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONTENT_SPOTS,
  dashboardAlerts,
  emptyContentSpots,
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
