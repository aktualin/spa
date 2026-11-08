import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  groupEvents,
  isEventPast,
  isEventUpcoming,
} from "../../src/lib/domain/events.ts";

/** U6 — pengelompokan event (upcoming / past / collaborations). */

const NOW = new Date("2026-03-01T10:00:00.000Z");

type Event = {
  id: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isCollaboration?: boolean;
};

const future: Event = {
  id: "future",
  startDate: new Date("2026-04-01T00:00:00.000Z"),
};
const past: Event = {
  id: "past",
  startDate: new Date("2026-01-01T00:00:00.000Z"),
};
const collaboration: Event = {
  id: "collab",
  startDate: new Date("2026-02-01T00:00:00.000Z"),
  isCollaboration: true,
};

describe("U6 isEventUpcoming / isEventPast", () => {
  it("event dengan tanggal mendatang dianggap upcoming", () => {
    assert.equal(isEventUpcoming(future, NOW), true);
    assert.equal(isEventPast(future, NOW), false);
  });

  it("event dengan tanggal lampau dianggap past", () => {
    assert.equal(isEventUpcoming(past, NOW), false);
    assert.equal(isEventPast(past, NOW), true);
  });

  it("event yang sedang berjalan dianggap upcoming", () => {
    const running: Event = {
      id: "running",
      startDate: new Date("2026-02-25T00:00:00.000Z"),
      endDate: new Date("2026-03-05T00:00:00.000Z"),
    };
    assert.equal(isEventUpcoming(running, NOW), true);
  });

  it("event tanpa tanggal dianggap upcoming", () => {
    assert.equal(isEventUpcoming({}, NOW), true);
  });
});

describe("U6 groupEvents", () => {
  it("memisahkan upcoming, past, dan collaborations", () => {
    const result = groupEvents([future, past, collaboration], NOW);
    assert.deepEqual(
      result.upcoming.map((e) => e.id),
      ["future"],
    );
    assert.deepEqual(
      result.past.map((e) => e.id),
      ["past"],
    );
    assert.deepEqual(
      result.collaborations.map((e) => e.id),
      ["collab"],
    );
  });

  it("kolaborasi selalu masuk kelompok collaborations, terlepas tanggal", () => {
    const futureCollab: Event = {
      id: "collab-mendatang",
      startDate: new Date("2027-01-01T00:00:00.000Z"),
      isCollaboration: true,
    };
    const result = groupEvents([futureCollab], NOW);
    assert.equal(result.collaborations.length, 1);
    assert.equal(result.upcoming.length, 0);
    assert.equal(result.past.length, 0);
  });

  it("upcoming diurutkan tanggal terdekat lebih dulu", () => {
    const later: Event = {
      id: "later",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
    };
    const sooner: Event = {
      id: "sooner",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
    };
    const result = groupEvents([later, sooner], NOW);
    assert.deepEqual(
      result.upcoming.map((e) => e.id),
      ["sooner", "later"],
    );
  });

  it("past diurutkan terbaru lebih dulu", () => {
    const older: Event = {
      id: "older",
      startDate: new Date("2025-01-01T00:00:00.000Z"),
    };
    const newer: Event = {
      id: "newer",
      startDate: new Date("2026-02-01T00:00:00.000Z"),
    };
    const result = groupEvents([older, newer], NOW);
    assert.deepEqual(
      result.past.map((e) => e.id),
      ["newer", "older"],
    );
  });

  it("daftar kosong menghasilkan tiga kelompok kosong", () => {
    const result = groupEvents([], NOW);
    assert.deepEqual(result.upcoming, []);
    assert.deepEqual(result.past, []);
    assert.deepEqual(result.collaborations, []);
  });
});
