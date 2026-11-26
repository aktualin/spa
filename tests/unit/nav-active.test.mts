import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { NavMegaGroup, NavPrimaryItem } from "../../src/data/content.ts";
import {
  isNavGroupActive,
  isNavLinkActive,
  pathOf,
} from "../../src/lib/domain/nav-active.ts";

/** State aktif navigasi (aria-current) — pencocokan pathname vs href. */

const servicesItem: NavPrimaryItem = {
  label: "Service Menu",
  href: "/menu",
  mega: "services",
};
const services: NavMegaGroup = {
  id: "services",
  label: "Service Menu",
  panel: "narrow",
  columns: [
    {
      title: "Layanan",
      links: [
        { label: "Body Massage", href: "/menu#massage" },
        { label: "Loyalty Member", href: "/membership" },
      ],
    },
  ],
  highlights: [],
};

describe("pathOf", () => {
  it("membuang hash dan query", () => {
    assert.equal(pathOf("/menu#massage"), "/menu");
    assert.equal(pathOf("/menu?x=1#y"), "/menu");
  });
  it("href kosong dianggap /", () => {
    assert.equal(pathOf(""), "/");
  });
});

describe("isNavLinkActive", () => {
  it("cocok persis dengan pathname", () => {
    assert.ok(isNavLinkActive("/gallery", "/gallery"));
    assert.ok(isNavLinkActive("/our-story", "/our-story"));
  });
  it("mengabaikan hash pada href", () => {
    assert.ok(isNavLinkActive("/menu", "/menu#massage"));
  });
  it("tidak cocok untuk prefiks palsu atau rute lain", () => {
    assert.equal(isNavLinkActive("/gallery-album", "/gallery"), false);
    assert.equal(isNavLinkActive("/our-story/journal/x", "/our-story"), false);
    assert.equal(isNavLinkActive("/", "/gallery"), false);
  });
});

describe("isNavGroupActive", () => {
  it("aktif di rute root dan rute anaknya", () => {
    assert.ok(isNavGroupActive("/menu", servicesItem, services));
    assert.ok(isNavGroupActive("/menu/sukma-laya", servicesItem, services));
  });
  it("aktif bila salah satu tautan kolom cocok (Loyalty Member)", () => {
    assert.ok(isNavGroupActive("/membership", servicesItem, services));
  });
  it("tidak aktif untuk rute lain atau prefiks palsu", () => {
    assert.equal(isNavGroupActive("/gallery", servicesItem, services), false);
    assert.equal(isNavGroupActive("/menu-alt", servicesItem, services), false);
  });
});