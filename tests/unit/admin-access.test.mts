import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_GROUPS,
  ADMIN_MODULES,
  activeHrefForPath,
  canAccessPath,
  groupedModulesForRole,
  moduleHintForPath,
  moduleLabelForPath,
  modulesForRole,
  rolesForPath,
} from "../../src/app/admin/modules.ts";
import {
  findAccessRule,
  groupModules,
  isSharedAdminPath,
  normalizeAdminPath,
  validateAccessMatrix,
  visibleModules,
} from "../../src/lib/domain/admin-access.ts";
import {
  generateTemporaryPassword,
  MIN_PASSWORD_LENGTH,
  validatePasswordStrength,
} from "../../src/lib/domain/password-policy.ts";

describe("BUILD-17 — matriks role → modul", () => {
  it("matriks konsisten: nomor & href unik, sub-menu tidak melebihi induk", () => {
    assert.deepEqual(validateAccessMatrix(ADMIN_MODULES), []);
  });

  it("modul pengaturan sistem hanya untuk ADMIN", () => {
    for (const path of [
      "/admin/users",
      "/admin/users/new",
      "/admin/users/abc123",
      "/admin/settings/contact",
      "/admin/settings/whatsapp",
      "/admin/status",
    ]) {
      assert.equal(canAccessPath("ADMIN", path), true, path);
      assert.equal(canAccessPath("EDITOR", path), false, path);
    }
  });

  it("modul konten terbuka untuk ADMIN dan EDITOR", () => {
    for (const path of [
      "/admin/treatments",
      "/admin/treatments/prices",
      "/admin/treatments/packages/x",
      "/admin/gallery/albums/a",
      "/admin/media/1",
      "/admin/promos",
      "/admin/gift-card",
      "/admin/membership/program",
      "/admin/journal/1/preview",
      "/admin/events/1",
      "/admin/retail/1",
      "/admin/corporate/inquiries/1",
      "/admin/corporate/programs/1",
      "/admin/homepage/highlights/1",
      "/admin/our-story",
      "/admin/pages/new",
      "/admin/redirects",
      "/admin/menu",
      "/admin/seo/1",
    ]) {
      assert.equal(canAccessPath("EDITOR", path), true, path);
      assert.equal(canAccessPath("ADMIN", path), true, path);
    }
  });

  it("dashboard dan halaman akun sendiri terbuka untuk semua role", () => {
    for (const path of ["/admin", "/admin/", "/admin/account/password"]) {
      assert.equal(isSharedAdminPath(path), true, path);
      assert.equal(canAccessPath("EDITOR", path), true, path);
    }
  });

  it("path admin yang tidak terdaftar ditutup untuk EDITOR (fail-closed)", () => {
    assert.deepEqual([...rolesForPath("/admin/modul-baru")], ["ADMIN"]);
    assert.deepEqual([...rolesForPath("/admin/settings")], ["ADMIN"]);
    assert.equal(canAccessPath("EDITOR", "/admin/settings/lainnya"), false);
  });

  it("pencocokan per segmen, bukan sekadar awalan teks", () => {
    // "/admin/usersx" bukan bagian dari "/admin/users".
    assert.equal(findAccessRule(ADMIN_MODULES, "/admin/usersx"), null);
    assert.equal(moduleLabelForPath("/admin/users/abc"), "Pengguna Admin");
    assert.equal(
      moduleLabelForPath("/admin/settings/whatsapp"),
      "Kontak & Umum — Template WhatsApp",
    );
    assert.equal(moduleLabelForPath("/admin/treatments/prices"), "Harga");
    assert.equal(moduleLabelForPath("javascript:alert(1)"), null);
  });

  it("normalizeAdminPath membuang query, hash, dan garis miring akhir", () => {
    assert.equal(normalizeAdminPath("/admin/users/?a=1"), "/admin/users");
    assert.equal(normalizeAdminPath("/admin/users#x"), "/admin/users");
    assert.equal(normalizeAdminPath("/admin/"), "/admin");
  });
});

describe("BUILD-17 — sidebar sesuai role", () => {
  it("EDITOR tidak melihat modul ADMIN saja", () => {
    const labels = modulesForRole("EDITOR").map((m) => m.label);
    assert.ok(!labels.includes("Pengguna Admin"));
    assert.ok(!labels.includes("Kontak & Umum"));
    assert.ok(!labels.includes("Backup & Status"));
    assert.ok(labels.includes("Journal"));
    assert.ok(labels.includes("SEO"));
  });

  it("ADMIN melihat semua modul", () => {
    assert.equal(modulesForRole("ADMIN").length, ADMIN_MODULES.length);
  });

  it("setiap modul yang tampil memang bisa dibuka (sidebar = guard)", () => {
    for (const role of ["ADMIN", "EDITOR"] as const) {
      for (const m of modulesForRole(role)) {
        assert.equal(canAccessPath(role, m.href), true, `${role} ${m.href}`);
        for (const c of m.children ?? []) {
          assert.equal(canAccessPath(role, c.href), true, `${role} ${c.href}`);
        }
      }
    }
  });

  it("sub-menu dengan role lebih sempit disembunyikan dari role lain", () => {
    const modules = [
      {
        no: 1,
        label: "Induk",
        href: "/admin/induk",
        roles: ["ADMIN", "EDITOR"] as const,
        children: [
          { label: "Umum", href: "/admin/induk/umum" },
          { label: "Rahasia", href: "/admin/induk/rahasia", roles: ["ADMIN"] as const },
        ],
      },
    ];
    const editor = visibleModules(modules, "EDITOR");
    assert.deepEqual(editor[0].children?.map((c) => c.label), ["Umum"]);
    assert.equal(findAccessRule(modules, "/admin/induk/rahasia/1")?.roles.length, 1);
  });

  it("validateAccessMatrix mendeteksi nomor ganda dan sub-menu melebihi induk", () => {
    const problems = validateAccessMatrix([
      { no: 1, label: "A", href: "/admin/a", roles: ["ADMIN"] },
      {
        no: 1,
        label: "B",
        href: "/admin/b",
        roles: ["ADMIN"],
        children: [{ label: "C", href: "/admin/b/c", roles: ["EDITOR"] }],
      },
    ]);
    assert.equal(problems.length, 2);
  });
});

describe("BUILD-17 — kata sandi akun admin", () => {
  it("kata sandi sementara acak memenuhi kebijakan dan selalu berbeda", () => {
    const a = generateTemporaryPassword();
    const b = generateTemporaryPassword();
    assert.notEqual(a, b);
    assert.match(a, /^[A-Za-z2-9]{4}(-[A-Za-z2-9]{4}){3}$/);
    assert.ok(a.length >= MIN_PASSWORD_LENGTH);
    assert.equal(validatePasswordStrength(a, { email: "x@kama.id" }), null);
  });

  it("menolak kata sandi yang sama dengan email atau bagian depannya", () => {
    assert.match(
      validatePasswordStrength("editor.kama.spa@example.com", {
        email: "editor.kama.spa@example.com",
      }) ?? "",
      /email/,
    );
    assert.match(
      validatePasswordStrength("Editor.Kama.Spa", { email: "editor.kama.spa@example.com" }) ?? "",
      /email/,
    );
  });
});

describe("Sidebar admin berkelompok", () => {
  it("setiap modul punya kelompok yang terdaftar dan petunjuk konteks", () => {
    const ids = new Set(ADMIN_GROUPS.map((g) => g.id));
    for (const m of ADMIN_MODULES) {
      assert.ok(ids.has(m.group), `Modul "${m.label}" memakai kelompok tak dikenal: ${m.group}`);
      assert.ok(m.hint.trim().length > 0, `Modul "${m.label}" belum punya petunjuk.`);
    }
  });

  it("pengelompokan tidak menghilangkan modul dan mengikuti urutan kelompok", () => {
    for (const role of ["ADMIN", "EDITOR"] as const) {
      const groups = groupedModulesForRole(role);
      const flat = groups.flatMap((g) => g.modules);
      assert.deepEqual(
        [...flat].map((m) => m.no).sort((a, b) => a - b),
        [...modulesForRole(role)].map((m) => m.no).sort((a, b) => a - b),
      );
      const order = groups.map((g) => g.id);
      const expected = ADMIN_GROUPS.map((g) => g.id).filter((id) => order.includes(id));
      assert.deepEqual(order, expected);
      for (const g of groups) assert.ok(g.modules.length > 0, `Kelompok ${g.id} kosong.`);
    }
  });

  it("EDITOR tidak melihat kelompok pengaturan sistem", () => {
    assert.ok(!groupedModulesForRole("EDITOR").some((g) => g.id === "sistem"));
    assert.ok(groupedModulesForRole("ADMIN").some((g) => g.id === "sistem"));
  });

  it("modul berkelompok tak dikenal tetap muncul di akhir", () => {
    const grouped = groupModules(
      [{ group: "katalog", label: "A" }, { group: "entah", label: "B" }],
      ADMIN_GROUPS,
    );
    assert.deepEqual(grouped.map((g) => g.id), ["katalog", "entah"]);
  });

  it("penanda aktif memilih awalan terpanjang, bukan modul induk", () => {
    assert.equal(activeHrefForPath("/admin/treatments/prices"), "/admin/treatments/prices");
    assert.equal(activeHrefForPath("/admin/treatments"), "/admin/treatments");
    assert.equal(activeHrefForPath("/admin/treatments/categories/new"), "/admin/treatments/categories");
    assert.equal(activeHrefForPath("/admin/settings/whatsapp"), "/admin/settings/whatsapp");
    assert.equal(activeHrefForPath("/admin"), null);
  });

  it("petunjuk sub-menu memakai petunjuk modul induknya", () => {
    const harga = ADMIN_MODULES.find((m) => m.href === "/admin/treatments/prices");
    const treatments = ADMIN_MODULES.find((m) => m.href === "/admin/treatments");
    assert.equal(moduleHintForPath("/admin/treatments/prices"), harga?.hint);
    assert.equal(moduleHintForPath("/admin/treatments/categories"), treatments?.hint);
    assert.equal(moduleHintForPath("/admin"), null);
    assert.equal(moduleHintForPath("/admin/account"), null);
  });
});
