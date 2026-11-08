import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  corporateInquiryLimiter,
  createRateLimiter,
  loginLimiter,
} from "../../src/lib/domain/rate-limit.ts";

describe("U10 createRateLimiter", () => {
  it("mengizinkan permintaan sampai batas, lalu menolak", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    assert.equal(limiter.check("1.1.1.1").allowed, true);
    assert.equal(limiter.check("1.1.1.1").allowed, true);
    assert.equal(limiter.check("1.1.1.1").allowed, true);

    const blocked = limiter.check("1.1.1.1");
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfterMs > 0);
  });

  it("menghitung sisa kuota dengan benar", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    assert.equal(limiter.check("a").remaining, 2);
    assert.equal(limiter.check("a").remaining, 1);
    assert.equal(limiter.check("a").remaining, 0);
  });

  it("menghitung kuota terpisah per key", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    assert.equal(limiter.check("1.1.1.1").allowed, true);
    assert.equal(limiter.check("1.1.1.1").allowed, false);
    // IP lain tidak ikut terkunci.
    assert.equal(limiter.check("2.2.2.2").allowed, true);
  });

  it("membuka kembali setelah jendela waktu lewat", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 20 });

    assert.equal(limiter.check("a").allowed, true);
    assert.equal(limiter.check("a").allowed, false);

    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(limiter.check("a").allowed, true);
  });

  it("reset(key) hanya membersihkan key tersebut", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    limiter.check("a");
    limiter.check("b");
    limiter.reset("a");

    assert.equal(limiter.check("a").allowed, true);
    assert.equal(limiter.check("b").allowed, false);
  });

  it("reset() tanpa argumen membersihkan semua key", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    limiter.check("a");
    limiter.check("b");
    limiter.reset();

    assert.equal(limiter.check("a").allowed, true);
    assert.equal(limiter.check("b").allowed, true);
  });
});

describe("U10 limiter bawaan", () => {
  it("corporate inquiry: 5 permintaan per IP", () => {
    corporateInquiryLimiter.reset("test-ip");

    for (let i = 0; i < 5; i += 1) {
      assert.equal(corporateInquiryLimiter.check("test-ip").allowed, true);
    }
    assert.equal(corporateInquiryLimiter.check("test-ip").allowed, false);

    corporateInquiryLimiter.reset("test-ip");
  });

  it("login admin: 10 percobaan per IP", () => {
    loginLimiter.reset("test-ip");

    for (let i = 0; i < 10; i += 1) {
      assert.equal(loginLimiter.check("test-ip").allowed, true);
    }
    assert.equal(loginLimiter.check("test-ip").allowed, false);

    loginLimiter.reset("test-ip");
  });
});
