import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  branchesCenter,
  branchInputSchema,
  canMoveBranch,
  nextBranchSortOrder,
  planBranchMove,
  sortBranches,
} from "../../src/lib/domain/branch.ts";

const row = (
  id: string,
  name: string,
  sortOrder: number,
  latitude: number | null = null,
  longitude: number | null = null,
) => ({ id, name, sortOrder, latitude, longitude });

describe("sortBranches", () => {
  it("mengurutkan berdasarkan sortOrder, lalu nama sebagai jejak", () => {
    const sorted = sortBranches([
      row("b", "Kebayoran", 1),
      row("a", "Zudisman", 0),
      row("c", "Batavia", 0),
    ]);
    // sortOrder 0 dulu (Batavia sebelum Zudisman), lalu sortOrder 1.
    assert.deepEqual(
      sorted.map((row) => row.id),
      ["c", "a", "b"],
    );
  });
});

describe("planBranchMove", () => {
  const rows = [row("a", "A", 0), row("b", "B", 1), row("c", "C", 2)];

  it("menurunkan dan menaikkan posisi", () => {
    assert.deepEqual(planBranchMove(rows, "b", "up"), [{ id: "b", sortOrder: 0 }, { id: "a", sortOrder: 1 }]);
    assert.deepEqual(planBranchMove(rows, "b", "down"), [{ id: "c", sortOrder: 1 }, { id: "b", sortOrder: 2 }]);
  });

  it("balik ke arah yang tidak ada → tidak ada perubahan", () => {
    assert.deepEqual(planBranchMove(rows, "a", "up"), []);
    assert.deepEqual(planBranchMove(rows, "c", "down"), []);
  });

  it("merapikan sortOrder kembar menjadi 0..n-1", () => {
    const doubled = [row("a", "A", 0), row("b", "B", 0), row("c", "C", 0)];
    // Hanya baris yang nilainya berubah yang dikembalikan; posisi b tetap 0.
    assert.deepEqual(planBranchMove(doubled, "a", "down"), [
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("canMoveBranch", () => {
    const ordered = sortBranches(rows);
    assert.equal(canMoveBranch(ordered, 0, "up"), false);
    assert.equal(canMoveBranch(ordered, 0, "down"), true);
    assert.equal(canMoveBranch(ordered, 2, "down"), false);
  });
});

describe("branchesCenter", () => {
  it("pusat peta = rata-rata koordinat cabang", () => {
    const center = branchesCenter([
      { latitude: -6.2, longitude: 106.8 },
      { latitude: -6.4, longitude: 106.86 },
      { latitude: null, longitude: null },
    ]);
    assert.ok(
      Math.abs((center?.latitude ?? 0) + 6.3) < 1e-9 &&
        Math.abs((center?.longitude ?? 0) - 106.83) < 1e-9,
    );
  });

  it("tanpa koordinat → null, peta tidak dirender", () => {
    assert.equal(branchesCenter([{ latitude: null, longitude: null }]), null);
    assert.equal(branchesCenter([]), null);
  });
});

describe("branchInputSchema", () => {
  const valid = {
    name: " South Jakarta ",
    slug: "south-jakarta",
    area: "Kramat Pela",
    openingHours: ["Mon – Sun. 10 AM – 8 PM", "  ", ""],
    whatsappNumber: " 0813-1605-2040 ",
    phone: "+6281316052040",
    mapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18",
    latitude: " -6.24 ",
    longitude: "106.79",
  };

  it("membersihkan isian form", () => {
    const parsed = branchInputSchema.parse({
      ...valid,
      isPublished: true,
    });
    assert.equal(parsed.name, "South Jakarta");
    assert.equal(parsed.slug, "south-jakarta");
    assert.equal(parsed.area, "Kramat Pela");
    // Baris kosong dibuang; sisanya tetap aman dipakai.
    assert.deepEqual(parsed.openingHours, ["Mon – Sun. 10 AM – 8 PM"]);
    // Nomor dinormalisasi jadi digit dengan awalan 62.
    assert.equal(parsed.whatsappNumber, "6281316052040");
    assert.equal(parsed.latitude, -6.24);
    assert.equal(parsed.longitude, 106.79);
    assert.equal(parsed.mapsEmbedUrl?.startsWith("https://www.google.com/maps/embed?"), true);
  });

  it("isian kosong menjadi null / tidak memicu error", () => {
    const parsed = branchInputSchema.parse({
      name: "X",
      slug: "x",
      area: "Y",
      openingHours: [],
      isPublished: false,
    });
    assert.equal(parsed.whatsappNumber, null);
    assert.equal(parsed.phone, null);
    assert.equal(parsed.mapsUrl, null);
    assert.equal(parsed.mapsEmbedUrl, null);
    assert.equal(parsed.latitude, null);
    assert.equal(parsed.longitude, null);
    assert.equal(parsed.email, null);
    assert.equal(parsed.sortOrder, null);
    assert.equal(parsed.isPublished, false);
  });

  it("isian di luar batas ditolak", () => {
    assert.equal(
      branchInputSchema.safeParse({ ...valid, latitude: "91", isPublished: true }).success,
      false,
    );
    assert.equal(
      branchInputSchema.safeParse({ ...valid, longitude: "200", isPublished: true }).success,
      false,
    );
    assert.equal(
      branchInputSchema.safeParse({ ...valid, whatsappNumber: "12", isPublished: true }).success,
      false,
    );
    assert.equal(
      branchInputSchema.safeParse({ ...valid, mapsEmbedUrl: "http://maps.google.com", isPublished: true })
        .success,
      false,
    );
  });
});

describe("nextBranchSortOrder", () => {
  it("menempatkan cabang baru setelah yang tertinggi", () => {
    assert.equal(nextBranchSortOrder(3), 4);
    assert.equal(nextBranchSortOrder(null), 0);
    assert.equal(nextBranchSortOrder(undefined), 0);
  });
});
