import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  endOfWibDay,
  eventDatesError,
  eventEndsAt,
  eventPhase,
  eventSlugError,
  formatEventDateRange,
  groupEvents,
  isEventPast,
  isEventUpcoming,
  normalizePartnerUrl,
} from "../../src/lib/domain/events.ts";

/** U6 — status & pengelompokan event (upcoming / past / collaborations). */

// 1 Maret 2026, 17.00 WIB.
const NOW = new Date("2026-03-01T10:00:00.000Z");

/** Tanggal input admin "YYYY-MM-DD" → 00.00 WIB (seperti parseWibInput). */
const wib = (day: string) => new Date(`${day}T00:00:00+07:00`);
/** Tanggal selesai input admin → 23.59.59,999 WIB. */
const wibEnd = (day: string) => new Date(`${day}T23:59:59.999+07:00`);

type Event = {
  id: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isCollaboration?: boolean;
  sortOrder?: number;
};

const future: Event = { id: "future", startDate: wib("2026-04-01") };
const past: Event = { id: "past", startDate: wib("2026-01-01") };
const pastCollab: Event = {
  id: "collab",
  startDate: wib("2026-02-01"),
  isCollaboration: true,
};

describe("U6 endOfWibDay / eventEndsAt", () => {
  it("akhir hari dihitung dalam WIB", () => {
    assert.equal(
      endOfWibDay(wib("2026-03-01")).toISOString(),
      wibEnd("2026-03-01").toISOString(),
    );
    // 23.30 WIB masih hari yang sama.
    assert.equal(
      endOfWibDay(new Date("2026-03-01T23:30:00+07:00")).toISOString(),
      wibEnd("2026-03-01").toISOString(),
    );
  });

  it("tanpa tanggal selesai → akhir hari tanggal mulai", () => {
    assert.equal(
      eventEndsAt({ startDate: wib("2026-03-01") })?.toISOString(),
      wibEnd("2026-03-01").toISOString(),
    );
    assert.equal(eventEndsAt({}), null);
  });
});

describe("U6 eventPhase", () => {
  it("tanggal mulai di masa depan → akan datang", () => {
    assert.equal(eventPhase(future, NOW), "upcoming");
    assert.equal(isEventUpcoming(future, NOW), true);
    assert.equal(isEventPast(future, NOW), false);
  });

  it("sudah selesai → sudah lewat", () => {
    assert.equal(eventPhase(past, NOW), "past");
    assert.equal(isEventUpcoming(past, NOW), false);
    assert.equal(isEventPast(past, NOW), true);
  });

  it("rentang yang mencakup sekarang → sedang berlangsung", () => {
    const running: Event = {
      id: "running",
      startDate: wib("2026-02-25"),
      endDate: wibEnd("2026-03-05"),
    };
    assert.equal(eventPhase(running, NOW), "ongoing");
    assert.equal(isEventUpcoming(running, NOW), true);
  });

  it("event satu hari tetap berlangsung sampai 23.59 WIB hari itu", () => {
    const today: Event = { id: "today", startDate: wib("2026-03-01") };
    assert.equal(eventPhase(today, NOW), "ongoing");
    assert.equal(eventPhase(today, new Date("2026-03-01T23:59:00+07:00")), "ongoing");
    assert.equal(eventPhase(today, new Date("2026-03-02T00:00:00+07:00")), "past");
  });

  it("tanpa tanggal: event biasa = tanggal menyusul, kolaborasi = arsip", () => {
    assert.equal(eventPhase({}, NOW), "tba");
    assert.equal(isEventUpcoming({}, NOW), true);
    assert.equal(eventPhase({ isCollaboration: true }, NOW), "past");
  });
});

describe("U6 groupEvents", () => {
  it("memisahkan upcoming, past, dan past collaborations", () => {
    const result = groupEvents([future, past, pastCollab], NOW);
    assert.deepEqual(result.upcoming.map((e) => e.id), ["future"]);
    assert.deepEqual(result.past.map((e) => e.id), ["past"]);
    assert.deepEqual(result.collaborations.map((e) => e.id), ["collab"]);
  });

  it("kolaborasi yang belum lewat tampil di upcoming, bukan past collaborations", () => {
    const futureCollab: Event = {
      id: "collab-mendatang",
      startDate: wib("2027-01-01"),
      isCollaboration: true,
    };
    const result = groupEvents([futureCollab], NOW);
    assert.deepEqual(result.upcoming.map((e) => e.id), ["collab-mendatang"]);
    assert.equal(result.collaborations.length, 0);
    assert.equal(result.past.length, 0);
  });

  it("kolaborasi tanpa tanggal masuk past collaborations", () => {
    const result = groupEvents([{ id: "arsip", isCollaboration: true }], NOW);
    assert.deepEqual(result.collaborations.map((e) => e.id), ["arsip"]);
  });

  it("upcoming: tanggal terdekat dulu, tanggal menyusul paling akhir", () => {
    const later: Event = { id: "later", startDate: wib("2026-06-01") };
    const sooner: Event = { id: "sooner", startDate: wib("2026-04-01") };
    const tba: Event = { id: "tba" };
    const result = groupEvents([tba, later, sooner], NOW);
    assert.deepEqual(result.upcoming.map((e) => e.id), ["sooner", "later", "tba"]);
  });

  it("past: terbaru dulu", () => {
    const older: Event = { id: "older", startDate: wib("2025-01-01") };
    const newer: Event = { id: "newer", startDate: wib("2026-02-01") };
    const result = groupEvents([older, newer], NOW);
    assert.deepEqual(result.past.map((e) => e.id), ["newer", "older"]);
  });

  it("urutan tampil (sortOrder) didahulukan sebelum tanggal", () => {
    const pinned: Event = { id: "pinned", startDate: wib("2026-09-01"), sortOrder: 0 };
    const normal: Event = { id: "normal", startDate: wib("2026-04-01"), sortOrder: 5 };
    const result = groupEvents([normal, pinned], NOW);
    assert.deepEqual(result.upcoming.map((e) => e.id), ["pinned", "normal"]);
  });

  it("daftar kosong menghasilkan tiga kelompok kosong", () => {
    const result = groupEvents([], NOW);
    assert.deepEqual(result, { upcoming: [], past: [], collaborations: [] });
  });
});

describe("U6 validasi input event", () => {
  it("slug: pola & slug yang dipakai route statis", () => {
    assert.equal(eventSlugError("spa-day-2026"), null);
    assert.match(eventSlugError("") ?? "", /wajib/);
    assert.match(eventSlugError("Spa Day") ?? "", /huruf kecil/);
    assert.match(eventSlugError("collaborations") ?? "", /dipakai halaman lain/);
  });

  it("tanggal: selesai ≥ mulai, selesai tanpa mulai ditolak", () => {
    assert.equal(eventDatesError(null, null), null);
    assert.equal(eventDatesError(wib("2026-03-01"), null), null);
    assert.equal(eventDatesError(wib("2026-03-01"), wibEnd("2026-03-01")), null);
    assert.match(
      eventDatesError(wib("2026-03-02"), wibEnd("2026-03-01")) ?? "",
      /tidak boleh sebelum/,
    );
    assert.match(eventDatesError(null, wibEnd("2026-03-01")) ?? "", /tanggal mulai/);
  });

  it("tautan mitra dirapikan dan divalidasi", () => {
    assert.equal(normalizePartnerUrl(""), null);
    assert.equal(normalizePartnerUrl(undefined), null);
    assert.equal(normalizePartnerUrl("kama.id"), "https://kama.id/");
    assert.equal(normalizePartnerUrl("https://brand.co.id/kolab"), "https://brand.co.id/kolab");
    assert.equal(normalizePartnerUrl("javascript:alert(1)"), undefined);
    assert.equal(normalizePartnerUrl("bukan url"), undefined);
  });
});

describe("U6 formatEventDateRange", () => {
  it("tanpa tanggal → Tanggal menyusul", () => {
    assert.equal(formatEventDateRange(null, null), "Tanggal menyusul");
  });

  it("memakai WIB: 00.00 WIB tidak mundur sehari", () => {
    assert.equal(formatEventDateRange(wib("2026-12-12"), null), "12 Desember 2026");
  });

  it("satu hari tidak ditulis dua kali; rentang memakai pemisah", () => {
    assert.equal(
      formatEventDateRange(wib("2026-12-12"), wibEnd("2026-12-12")),
      "12 Desember 2026",
    );
    assert.equal(
      formatEventDateRange(wib("2026-12-12"), wibEnd("2026-12-14")),
      "12 Desember 2026 — 14 Desember 2026",
    );
  });
});
