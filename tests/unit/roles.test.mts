import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_ONLY_ROLES,
  CONTENT_ROLES,
  canManageModule,
  hasRole,
} from "../../src/lib/domain/roles.ts";

/** U8 — pemeriksaan role admin. */

describe("U8 hasRole", () => {
  it("ADMIN lolos untuk daftar yang memuat ADMIN", () => {
    assert.equal(hasRole("ADMIN", ["ADMIN"]), true);
    assert.equal(hasRole("ADMIN", ["ADMIN", "EDITOR"]), true);
    assert.equal(hasRole("ADMIN", CONTENT_ROLES), true);
  });

  it("EDITOR lolos untuk daftar konten, ditolak untuk ADMIN_ONLY_ROLES", () => {
    assert.equal(hasRole("EDITOR", ["ADMIN", "EDITOR"]), true);
    assert.equal(hasRole("EDITOR", CONTENT_ROLES), true);
    assert.equal(hasRole("EDITOR", ["ADMIN"]), false);
    assert.equal(hasRole("EDITOR", ADMIN_ONLY_ROLES), false);
  });

  it("daftar kosong menolak semua role", () => {
    assert.equal(hasRole("ADMIN", []), false);
    assert.equal(hasRole("EDITOR", []), false);
  });

  it("canManageModule memakai aturan yang sama dengan hasRole", () => {
    assert.equal(canManageModule("ADMIN", ADMIN_ONLY_ROLES), true);
    assert.equal(canManageModule("EDITOR", ADMIN_ONLY_ROLES), false);
    assert.equal(canManageModule("EDITOR", CONTENT_ROLES), true);
  });
});

describe("U8 konstanta role", () => {
  it("ADMIN_ONLY_ROLES hanya berisi ADMIN", () => {
    assert.deepEqual([...ADMIN_ONLY_ROLES], ["ADMIN"]);
  });

  it("CONTENT_ROLES berisi ADMIN dan EDITOR", () => {
    assert.deepEqual([...CONTENT_ROLES].sort(), ["ADMIN", "EDITOR"]);
  });
});
