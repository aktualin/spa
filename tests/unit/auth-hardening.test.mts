import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_HOME,
  safeAdminNext,
} from "../../src/lib/domain/admin-redirect.ts";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "../../src/lib/domain/password-policy.ts";
import {
  isSameOrigin,
  isStateChangingMethod,
} from "../../src/lib/domain/same-origin.ts";

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null };
}

describe("AUTH-10 — kebijakan kata sandi baru", () => {
  const ok = "kalimat-panjang-aman";

  it("menerima kata sandi yang memenuhi syarat", () => {
    assert.equal(
      validateNewPassword({ newPassword: ok, confirmPassword: ok, currentPassword: "lama-sekali-123" }),
      null,
    );
  });

  it("menolak yang lebih pendek dari batas minimum", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    assert.match(
      validateNewPassword({ newPassword: short, confirmPassword: short }) ?? "",
      /minimal/,
    );
  });

  it("menerima tepat di batas minimum", () => {
    const exact = "a".repeat(MIN_PASSWORD_LENGTH);
    assert.equal(validateNewPassword({ newPassword: exact, confirmPassword: exact }), null);
  });

  it("menolak yang melebihi batas maksimum", () => {
    const long = "a".repeat(MAX_PASSWORD_LENGTH + 1);
    assert.match(
      validateNewPassword({ newPassword: long, confirmPassword: long }) ?? "",
      /maksimal/,
    );
  });

  it("menolak yang hanya berisi spasi", () => {
    const blank = " ".repeat(MIN_PASSWORD_LENGTH);
    assert.match(
      validateNewPassword({ newPassword: blank, confirmPassword: blank }) ?? "",
      /spasi/,
    );
  });

  it("menolak konfirmasi yang tidak sama", () => {
    assert.match(
      validateNewPassword({ newPassword: ok, confirmPassword: `${ok}x` }) ?? "",
      /Konfirmasi/,
    );
  });

  it("menolak kata sandi baru yang sama dengan yang lama", () => {
    assert.match(
      validateNewPassword({ newPassword: ok, confirmPassword: ok, currentPassword: ok }) ?? "",
      /berbeda/,
    );
  });
});

describe("AUTH-14 — tujuan setelah login (anti open redirect)", () => {
  it("mengizinkan path admin internal", () => {
    assert.equal(safeAdminNext("/admin/treatments"), "/admin/treatments");
    assert.equal(safeAdminNext("/admin/treatments/abc?tab=1"), "/admin/treatments/abc?tab=1");
    assert.equal(safeAdminNext("/admin"), "/admin");
  });

  it("jatuh ke dashboard bila kosong", () => {
    assert.equal(safeAdminNext(undefined), ADMIN_HOME);
    assert.equal(safeAdminNext(null), ADMIN_HOME);
    assert.equal(safeAdminNext(""), ADMIN_HOME);
  });

  const hostile = [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/admin//evil.com",
    "/admin\\..\\evil",
    "/adminx",
    "/admin.evil.com",
    "/treatments",
    "javascript:alert(1)",
    "/admin/\u0000",
    "/admin/login",
    "/admin/login?next=/admin",
    "/admin/logout",
  ];
  for (const value of hostile) {
    it(`menolak ${JSON.stringify(value)}`, () => {
      assert.equal(safeAdminNext(value), ADMIN_HOME);
    });
  }
});

describe("SEC-05/06 — pemeriksaan same-origin", () => {
  it("menerima origin yang sama dengan host", () => {
    assert.equal(
      isSameOrigin(headers({ origin: "https://kamaspa.id", host: "kamaspa.id" })),
      true,
    );
  });

  it("memakai x-forwarded-host bila ada", () => {
    assert.equal(
      isSameOrigin(
        headers({
          origin: "https://kamaspa.id",
          host: "internal:3000",
          "x-forwarded-host": "kamaspa.id",
        }),
      ),
      true,
    );
  });

  it("menolak origin situs lain", () => {
    assert.equal(
      isSameOrigin(headers({ origin: "https://evil.com", host: "kamaspa.id" })),
      false,
    );
  });

  it("menolak subdomain yang mirip", () => {
    assert.equal(
      isSameOrigin(headers({ origin: "https://kamaspa.id.evil.com", host: "kamaspa.id" })),
      false,
    );
  });

  it('menolak origin "null" (iframe sandbox / file://)', () => {
    assert.equal(isSameOrigin(headers({ origin: "null", host: "kamaspa.id" })), false);
  });

  it("menolak origin yang tidak bisa diurai", () => {
    assert.equal(isSameOrigin(headers({ origin: "::::", host: "kamaspa.id" })), false);
  });

  it("menerima permintaan tanpa Origin (bukan browser lintas situs)", () => {
    assert.equal(isSameOrigin(headers({ host: "kamaspa.id" })), true);
  });

  it("hanya metode yang mengubah data yang diperiksa", () => {
    assert.equal(isStateChangingMethod("GET"), false);
    assert.equal(isStateChangingMethod("head"), false);
    assert.equal(isStateChangingMethod("OPTIONS"), false);
    assert.equal(isStateChangingMethod("POST"), true);
    assert.equal(isStateChangingMethod("delete"), true);
  });
});
