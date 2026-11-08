import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isJournalVisible,
  isPromoActive,
  sortJournalByDate,
} from "../../src/lib/domain/visibility.ts";

/** U4 — visibilitas promo; U5 — visibilitas journal. */

const NOW = new Date("2026-03-01T10:00:00.000Z");

describe("U4 isPromoActive", () => {
  it("true saat now berada di antara startDate dan endDate", () => {
    const promo = {
      isPublished: true,
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: new Date("2026-04-01T00:00:00.000Z"),
    };
    assert.equal(isPromoActive(promo, NOW), true);
  });

  it("false sebelum startDate", () => {
    assert.equal(
      isPromoActive(
        {
          isPublished: true,
          startDate: new Date("2026-03-02T00:00:00.000Z"),
          endDate: new Date("2026-04-01T00:00:00.000Z"),
        },
        NOW,
      ),
      false,
    );
  });

  it("false setelah endDate", () => {
    assert.equal(
      isPromoActive(
        {
          isPublished: true,
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-02-28T00:00:00.000Z"),
        },
        NOW,
      ),
      false,
    );
  });

  it("false kalau promo tidak dipublikasikan", () => {
    assert.equal(
      isPromoActive(
        {
          isPublished: false,
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-12-01T00:00:00.000Z"),
        },
        NOW,
      ),
      false,
    );
  });

  it("promo tanpa tanggal tetap aktif bila published", () => {
    assert.equal(isPromoActive({ isPublished: true }, NOW), true);
  });
});

describe("U5 isJournalVisible", () => {
  it("PUBLISHED tanpa tanggal tetap tampil", () => {
    assert.equal(isJournalVisible({ status: "PUBLISHED" }, NOW), true);
  });

  it("PUBLISHED dengan tanggal lampau tampil", () => {
    assert.equal(
      isJournalVisible(
        { status: "PUBLISHED", publishedAt: new Date("2026-02-01T00:00:00.000Z") },
        NOW,
      ),
      true,
    );
  });

  it("SCHEDULED tampil setelah jadwalnya tiba", () => {
    assert.equal(
      isJournalVisible(
        { status: "SCHEDULED", publishedAt: new Date("2026-02-28T00:00:00.000Z") },
        NOW,
      ),
      true,
    );
  });

  it("SCHEDULED belum tampil sebelum jadwalnya", () => {
    assert.equal(
      isJournalVisible(
        { status: "SCHEDULED", publishedAt: new Date("2026-03-05T00:00:00.000Z") },
        NOW,
      ),
      false,
    );
  });

  it("SCHEDULED tanpa tanggal tidak pernah tampil", () => {
    assert.equal(isJournalVisible({ status: "SCHEDULED" }, NOW), false);
  });

  it("DRAFT dan ARCHIVED tidak pernah tampil, terlepas tanggal", () => {
    for (const status of ["DRAFT", "ARCHIVED"]) {
      assert.equal(
        isJournalVisible({ status, publishedAt: new Date("2020-01-01T00:00:00.000Z") }, NOW),
        false,
        status,
      );
    }
  });
});

describe("U5 sortJournalByDate", () => {
  it("mengurutkan terbaru lebih dulu", () => {
    const posts = [
      { publishedAt: new Date("2026-01-01T00:00:00.000Z") },
      { publishedAt: new Date("2026-03-01T00:00:00.000Z") },
      { publishedAt: new Date("2026-02-01T00:00:00.000Z") },
    ];
    const sorted = sortJournalByDate(posts);
    assert.equal(sorted[0].publishedAt?.toISOString(), "2026-03-01T00:00:00.000Z");
    assert.equal(sorted[2].publishedAt?.toISOString(), "2026-01-01T00:00:00.000Z");
  });

  it("tidak mengubah array asal", () => {
    const posts = [
      { publishedAt: new Date("2026-01-01T00:00:00.000Z") },
      { publishedAt: new Date("2026-03-01T00:00:00.000Z") },
    ];
    sortJournalByDate(posts);
    assert.equal(posts[0].publishedAt?.toISOString(), "2026-01-01T00:00:00.000Z");
  });
});
