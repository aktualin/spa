import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  corporateBenefits,
  corporatePrograms,
  corporateSolutions,
} from "../../src/data/content.ts";
import {
  STATIC_COLLAB_PHOTOS,
  STATIC_HERO_TITLE,
  STATIC_IN_SPA_HTML,
  STATIC_PIC,
  buildInquiryEmail,
  checkFillTime,
  collabPhotosFor,
  escapeHtml,
  isPhone,
  nextSortOrder,
  normalizeWebsiteUrl,
  optionalHtml,
  parseSolutionsInput,
  readSolutions,
  reorderUpdates,
  resolveCaptchaPolicy,
  resolveCorporateContent,
  resolveInquiryRecipients,
  emptyCorporateContent,
  staticCorporateContent,
  staticCorporatePrograms,
  staticCorporateSteps,
  validateClientInput,
  validateContentInput,
  validatePicInput,
  validateProgramInput,
  validateStepInput,
  type CorporateContentRow,
} from "../../src/lib/domain/corporate.ts";

function row(overrides: Partial<CorporateContentRow> = {}): CorporateContentRow {
  return {
    heroTitle: "Judul",
    intro: null,
    inOfficeHtml: null,
    inSpaHtml: null,
    stepsHtml: null,
    picName: null,
    picEmail: null,
    picPhone: null,
    benefits: [],
    solutions: null,
    inSpaItems: [],
    ...overrides,
  };
}

describe("isi bawaan = desain asli /corporate", () => {
  it("konten statis memakai data content.ts", () => {
    const c = staticCorporateContent();
    assert.equal(c.heroTitle, STATIC_HERO_TITLE);
    assert.deepEqual(c.benefits, corporateBenefits);
    assert.deepEqual(c.solutions, corporateSolutions);
    assert.equal(c.inSpaItems.length, 6);
    assert.equal(c.inSpaHtml, null);
    assert.deepEqual(c.pic, { name: "Roy", email: "marketing@kamaspa.id", phone: "+62 813-1485-6565" });
  });

  it("program & langkah bawaan", () => {
    assert.deepEqual(
      staticCorporatePrograms().map((p) => p.name),
      corporatePrograms.map((p) => p.name),
    );
    assert.equal(staticCorporateSteps().length, 4);
    assert.equal(staticCorporateSteps()[0].title, "Discovery & Consultation");
  });

  it("baris DB null → seluruhnya kosong, tanpa fallback statis", () => {
    assert.deepEqual(resolveCorporateContent(null), emptyCorporateContent());
  });

  it("kolom kosong tetap kosong; tidak diam-diam diisi teks bawaan", () => {
    const c = resolveCorporateContent(
      row({ heroTitle: "Baru", benefits: ["A", " "], picName: "Sari", picEmail: "  " }),
    );
    assert.equal(c.heroTitle, "Baru");
    assert.deepEqual(c.benefits, ["A"]);
    assert.equal(c.pic.name, "Sari");
    // Kolom yang dikosongkan admin tidak boleh kembali ke isi statis.
    assert.deepEqual(c.solutions, []);
    assert.equal(c.intro, "");
    assert.equal(c.pic.email, "");
    assert.notEqual(c.intro, staticCorporateContent().intro);
    assert.notEqual(c.pic.email, STATIC_PIC.email);
  });

  it("HTML tanpa teks terlihat dianggap kosong", () => {
    const c = resolveCorporateContent(row({ inSpaHtml: "<p> </p>", stepsHtml: "<p>Catatan</p>" }));
    assert.equal(c.inSpaHtml, null);
    assert.equal(c.stepsHtml, "<p>Catatan</p>");
  });
});

describe("readSolutions / parseSolutionsInput", () => {
  it("membuang entri rusak", () => {
    assert.deepEqual(
      readSolutions([{ title: "A", items: ["x", 1, ""] }, { title: "" }, "x", null]),
      [{ title: "A", items: ["x"] }],
    );
    assert.deepEqual(readSolutions({}), []);
  });

  it("blok kosong diabaikan, poin per baris", () => {
    const r = parseSolutionsInput(["A", "", "B"], ["x\n\ny ", "", "z"]);
    assert.deepEqual(r, {
      ok: true,
      data: [
        { title: "A", items: ["x", "y"] },
        { title: "B", items: ["z"] },
      ],
    });
  });

  it("blok berisi tanpa judul ditolak", () => {
    const r = parseSolutionsInput([""], ["x"]);
    assert.equal(r.ok, false);
  });
});

describe("validasi admin", () => {
  it("konten: judul wajib, daftar dirapikan", () => {
    assert.equal(
      validateContentInput({
        heroTitle: " ",
        intro: "",
        benefits: [],
        solutionTitles: [],
        solutionItems: [],
        inSpaItems: [],
      }).ok,
      false,
    );
    const r = validateContentInput({
      heroTitle: "Judul",
      intro: "",
      benefits: ["A", "A", " ", "B"],
      solutionTitles: ["S"],
      solutionItems: ["1"],
      inSpaItems: ["X"],
    });
    assert.ok(r.ok);
    if (r.ok) {
      assert.deepEqual(r.data.benefits, ["A", "B"]);
      assert.equal(r.data.intro, null);
    }
  });

  it("optionalHtml: kosong / sama dengan bawaan → null", () => {
    assert.equal(optionalHtml("<p></p>"), null);
    assert.equal(optionalHtml(STATIC_IN_SPA_HTML, STATIC_IN_SPA_HTML), null);
    assert.equal(optionalHtml("<p>Lain</p>", STATIC_IN_SPA_HTML), "<p>Lain</p>");
  });

  it("PIC: email & telepon divalidasi", () => {
    assert.ok(validatePicInput({ name: "Roy", email: "Roy@KamaSpa.id", phone: "+62 813-1485-6565" }).ok);
    assert.equal(validatePicInput({ name: "Roy", email: "bukan-email", phone: "08131485656" }).ok, false);
    assert.equal(validatePicInput({ name: "Roy", email: "a@b.id", phone: "123" }).ok, false);
    assert.equal(validatePicInput({ name: "", email: "a@b.id", phone: "08131485656" }).ok, false);
    assert.equal(isPhone("0813 1485 6565"), true);
    assert.equal(isPhone("0813-abc"), false);
    const r = validatePicInput({ name: " Roy ", email: "Roy@KamaSpa.id", phone: "0813" + "14856565" });
    assert.ok(r.ok && r.data.email === "roy@kamaspa.id" && r.data.name === "Roy");
  });

  it("program: nama wajib, fitur dirapikan, URL gambar divalidasi", () => {
    const base = { name: "Essential", description: "", features: ["A", "", "B"], imageUrl: "", isPublished: true };
    const r = validateProgramInput(base);
    assert.ok(r.ok && r.data.features.length === 2 && r.data.imageUrl === null && r.data.description === null);
    assert.equal(validateProgramInput({ ...base, name: "" }).ok, false);
    assert.equal(validateProgramInput({ ...base, imageUrl: "javascript:alert(1)" }).ok, false);
    assert.ok(validateProgramInput({ ...base, imageUrl: "https://x.supabase.co/a.jpg" }).ok);
  });

  it("langkah: judul wajib", () => {
    assert.equal(validateStepInput({ title: "", body: "x" }).ok, false);
    assert.deepEqual(validateStepInput({ title: "A", body: "" }), { ok: true, data: { title: "A", body: null } });
  });

  it("website klien dinormalisasi; skema berbahaya ditolak", () => {
    assert.deepEqual(normalizeWebsiteUrl("perusahaan.co.id"), { ok: true, data: "https://perusahaan.co.id/" });
    assert.deepEqual(normalizeWebsiteUrl(""), { ok: true, data: null });
    assert.equal(normalizeWebsiteUrl("javascript:alert(1)").ok, false);
    assert.equal(normalizeWebsiteUrl("localhost").ok, false);
  });

  it("klien: foto kembar dibuang, URL tidak valid ditolak", () => {
    const base = { name: "PT A", logoUrl: "", websiteUrl: "", photoUrls: ["/img/a.jpg", "/img/a.jpg", ""], isPublished: true };
    const r = validateClientInput(base);
    assert.ok(r.ok && r.data.photoUrls.length === 1);
    assert.equal(validateClientInput({ ...base, photoUrls: ["data:image/png;base64,xx"] }).ok, false);
    assert.equal(
      validateClientInput({ ...base, photoUrls: Array.from({ length: 31 }, (_, i) => `/img/${i}.jpg`) }).ok,
      false,
    );
  });
});

describe("urutan ↑/↓", () => {
  const rows = [
    { id: "a", sortOrder: 0 },
    { id: "b", sortOrder: 0 },
    { id: "c", sortOrder: 5 },
  ];

  it("menaikkan item kedua dan merapatkan urutan (hanya baris yang berubah)", () => {
    // b sudah bernilai 0 sehingga tidak perlu ditulis ulang.
    assert.deepEqual(reorderUpdates(rows, "b", "up"), [
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("item teratas tidak bisa naik (hanya perapatan)", () => {
    assert.deepEqual(reorderUpdates(rows, "a", "up"), [
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
    assert.deepEqual(reorderUpdates(rows, "x", "up"), []);
  });

  it("nextSortOrder", () => {
    assert.equal(nextSortOrder(null), 0);
    assert.equal(nextSortOrder(4), 5);
  });
});

describe("Past Collaborations", () => {
  it("belum ada klien → tidak ada foto kolaborasi sama sekali", () => {
    assert.deepEqual(collabPhotosFor(null), []);
  });

  it("ada klien → foto dokumentasi klien berurutan", () => {
    const photos = collabPhotosFor([
      { id: "1", name: "PT A", logoUrl: null, websiteUrl: null, photoUrls: ["/a1.jpg", "/a2.jpg"] },
      { id: "2", name: "PT B", logoUrl: null, websiteUrl: null, photoUrls: ["/b1.jpg"] },
    ]);
    assert.deepEqual(photos.map((p) => p.src), ["/a1.jpg", "/a2.jpg", "/b1.jpg"]);
    assert.match(photos[2].alt, /^PT B/);
  });
});

describe("anti-spam inquiry", () => {
  it("checkFillTime", () => {
    assert.equal(checkFillTime(undefined), "missing");
    assert.equal(checkFillTime("5000"), "missing");
    assert.equal(checkFillTime(-1), "missing");
    assert.equal(checkFillTime(1200), "too-fast");
    assert.equal(checkFillTime(3000), "ok");
  });

  it("captcha: fail-closed di production tanpa secret", () => {
    assert.equal(resolveCaptchaPolicy({ secret: "s", nodeEnv: "production" }), "verify");
    assert.equal(resolveCaptchaPolicy({ secret: "", nodeEnv: "production" }), "unavailable");
    assert.equal(resolveCaptchaPolicy({ secret: undefined, nodeEnv: "production" }), "unavailable");
    assert.equal(resolveCaptchaPolicy({ secret: "  ", nodeEnv: "development" }), "skip");
    assert.equal(resolveCaptchaPolicy({ secret: "s", nodeEnv: "development" }), "verify");
  });
});

describe("email ke pihak pertama", () => {
  it("penerima: env (boleh banyak) → email PIC", () => {
    assert.deepEqual(
      resolveInquiryRecipients({ envTo: "a@kama.id, salah, b@kama.id", picEmail: "pic@kama.id" }),
      ["a@kama.id", "b@kama.id"],
    );
    assert.deepEqual(resolveInquiryRecipients({ envTo: "", picEmail: "pic@kama.id" }), ["pic@kama.id"]);
    assert.deepEqual(resolveInquiryRecipients({ envTo: undefined, picEmail: "x" }), []);
  });

  it("isi email di-escape; subjek satu baris", () => {
    const mail = buildInquiryEmail({
      name: "<script>alert(1)</script>",
      company: "PT \"A\" & B\r\nBcc: x@y.z",
      email: "a@b.id",
      phone: null,
      message: "Halo\n<b>tebal</b>",
      adminUrl: "https://kamaspa.id/admin/corporate/inquiries/abc",
    });
    assert.ok(!mail.html.includes("<script>"));
    assert.ok(mail.html.includes("&lt;script&gt;"));
    assert.ok(mail.html.includes("&lt;b&gt;tebal&lt;/b&gt;"));
    assert.ok(mail.html.includes("Halo<br />"));
    assert.ok(!/[\r\n]/.test(mail.subject));
    assert.ok(!mail.text.includes("Telepon:"));
    assert.equal(escapeHtml(`'"&<>`), "&#39;&quot;&amp;&lt;&gt;");
  });
});
