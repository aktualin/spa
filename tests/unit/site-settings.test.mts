import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { locations, site } from "../../src/data/content.ts";
import {
  applySiteSettingsToLocations,
  directionsUrl,
  footerSocials,
  formatPhoneDisplay,
  instagramUsernameFromUrl,
  isPlatformUrl,
  mergeSiteSettings,
  normalizeGa4Id,
  normalizeInstagramUsername,
  normalizeWhatsAppNumber,
  parseMapsEmbedInput,
  siteSettingsFormDefaults,
  siteSettingsInputSchema,
  emptySiteSettings,
  toSiteSettingsWrite,
  type SiteSettingsInput,
  type SiteSettingsRow,
} from "../../src/lib/domain/site-settings.ts";

/** Baris DB saat ini (diperiksa read-only) — harus menghasilkan tampilan lama. */
const CURRENT_ROW: SiteSettingsRow = {
  address: "Jl. Barito I No.21, Kramat Pela, Jakarta Selatan",
  mapsEmbedUrl: null,
  openingHours: ["Mon – Sun. 10 AM – 8 PM"],
  whatsappNumber: "6281316052040",
  email: "hello@kamaspa.id",
  phone: "+6281316052040",
  instagramUrl: "https://www.instagram.com/kama__spa",
  instagramUsername: null,
  tiktokUrl: "https://www.tiktok.com/@kama__spa",
  facebookUrl: null,
  freshaUrl: null,
  ga4MeasurementId: null,
  footerTagline: null,
  priceDisclaimer: null,
  bookNowLabel: null,
  bookNowHref: null,
  menuScanUrls: [],
  menuPdfUrl: null,
  footerMembershipTitle: null,
  footerMembershipLearnLabel: null,
  footerMembershipJoinLabel: null,
  partnershipIntro: null,
  partnershipEmail: null,
};

const EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d17291.6!2d106.78!3d-6.24!5e0";

function input(overrides: Partial<SiteSettingsInput> = {}): SiteSettingsInput {
  return {
    address: "Jl. Barito I No.21",
    openingHours: ["Mon – Sun. 10 AM – 8 PM"],
    whatsappNumber: "0813-1605-2040",
    email: "Hello@KamaSpa.id",
    phone: "",
    instagramUrl: "",
    instagramUsername: "",
    tiktokUrl: "",
    facebookUrl: "",
    freshaUrl: "",
    mapsEmbedUrl: "",
    ga4MeasurementId: "",
    footerTagline: "",
    priceDisclaimer: "",
    bookNowLabel: "",
    bookNowHref: "",
    menuScanUrls: [],
    menuPdfUrl: "",
    footerMembershipTitle: "",
    footerMembershipLearnLabel: "",
    footerMembershipJoinLabel: "",
    partnershipIntro: "",
    partnershipEmail: "",
    ...overrides,
  };
}

describe("normalizeWhatsAppNumber", () => {
  it("menormalkan format Indonesia ke 62…", () => {
    assert.equal(normalizeWhatsAppNumber("0813-1605-2040"), "6281316052040");
    assert.equal(normalizeWhatsAppNumber("+62 813 1605 2040"), "6281316052040");
    assert.equal(normalizeWhatsAppNumber("81316052040"), "6281316052040");
    assert.equal(normalizeWhatsAppNumber("0062 813 1605 2040"), "6281316052040");
    assert.equal(normalizeWhatsAppNumber("(0813) 1605.2040"), "6281316052040");
  });
  it("mempertahankan nomor negara lain bertanda +", () => {
    assert.equal(normalizeWhatsAppNumber("+65 9123 4567"), "6591234567");
  });
  it("menolak huruf dan panjang di luar 8–15 digit", () => {
    assert.equal(normalizeWhatsAppNumber("0813abc"), null);
    assert.equal(normalizeWhatsAppNumber("0812"), null);
    assert.equal(normalizeWhatsAppNumber("+62 8123 4567 8901 234"), null);
    assert.equal(normalizeWhatsAppNumber(""), null);
  });
});

describe("formatPhoneDisplay", () => {
  it("menghasilkan tampilan yang sama dengan data statis", () => {
    assert.equal(formatPhoneDisplay("6281316052040"), "+62 813-1605-2040");
    assert.equal(formatPhoneDisplay("6281316052040"), locations[0].phone);
    assert.equal(formatPhoneDisplay("6591234567"), "+6591234567");
  });
});

describe("parseMapsEmbedInput", () => {
  it("menerima URL embed Google Maps", () => {
    assert.equal(parseMapsEmbedInput(EMBED), EMBED);
  });
  it("mengekstrak src dari kode iframe", () => {
    const html = `<iframe src="${EMBED.replace("!5e0", "!5e0&amp;x=1")}" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>`;
    assert.equal(parseMapsEmbedInput(html), `${EMBED}&x=1`);
  });
  it("menolak URL lain dan HTML berbahaya", () => {
    assert.equal(parseMapsEmbedInput("https://maps.google.com/?q=kama"), null);
    assert.equal(parseMapsEmbedInput("http://www.google.com/maps/embed?pb=1"), null);
    assert.equal(parseMapsEmbedInput("https://www.google.com/maps/embed?"), null);
    assert.equal(parseMapsEmbedInput("https://www.google.com.evil.com/maps/embed?pb=1"), null);
    assert.equal(parseMapsEmbedInput(`${EMBED}"><script>alert(1)</script>`), null);
    assert.equal(parseMapsEmbedInput('<iframe src="https://evil.com/x"></iframe>'), null);
    assert.equal(parseMapsEmbedInput("<iframe></iframe>"), null);
  });
});

describe("username Instagram, URL platform, GA4", () => {
  it("membuang @ dan memvalidasi pola", () => {
    assert.equal(normalizeInstagramUsername("@Kama__Spa"), "kama__spa");
    assert.equal(normalizeInstagramUsername("kama.spa"), "kama.spa");
    assert.equal(normalizeInstagramUsername("kama spa"), null);
    assert.equal(normalizeInstagramUsername(".kama"), null);
    assert.equal(normalizeInstagramUsername("kama..spa"), null);
    assert.equal(normalizeInstagramUsername("a".repeat(31)), null);
  });
  it("menurunkan username dari URL Instagram", () => {
    assert.equal(instagramUsernameFromUrl("https://www.instagram.com/kama__spa/"), "kama__spa");
    assert.equal(instagramUsernameFromUrl("https://www.tiktok.com/@kama__spa"), null);
  });
  it("memeriksa domain platform dan https", () => {
    assert.ok(isPlatformUrl("https://www.instagram.com/kama__spa", "instagram"));
    assert.ok(isPlatformUrl("https://m.facebook.com/kama", "facebook"));
    assert.ok(!isPlatformUrl("http://www.instagram.com/kama__spa", "instagram"));
    assert.ok(!isPlatformUrl("https://instagram.com.evil.io/x", "instagram"));
    assert.ok(isPlatformUrl("https://www.fresha.com/a/kama-spa", "fresha"));
  });
  it("memvalidasi Measurement ID GA4", () => {
    assert.equal(normalizeGa4Id("g-abc123def4"), "G-ABC123DEF4");
    assert.equal(normalizeGa4Id("UA-12345-1"), null);
    assert.equal(normalizeGa4Id("G-12"), null);
  });
});

describe("siteSettingsInputSchema", () => {
  it("menormalkan isian valid", () => {
    const parsed = siteSettingsInputSchema.parse(
      input({
        openingHours: ["  Mon – Fri  10 AM – 8 PM ", "", "Sat – Sun 9 AM – 9 PM"],
        instagramUsername: "@Kama__Spa",
        mapsEmbedUrl: `<iframe src="${EMBED}"></iframe>`,
        ga4MeasurementId: "g-abcdef1234",
        instagramUrl: "https://www.instagram.com/kama__spa",
        footerTagline: "  Your ritual, your pace.  ",
        bookNowLabel: " Book Now ",
        bookNowHref: "/contact",
        menuScanUrls: [" https://cdn.example.com/menu-01.jpg ", "", "https://cdn.example.com/img/menu-02.jpg"],
      }),
    );
    assert.equal(parsed.whatsappNumber, "6281316052040");
    assert.equal(parsed.email, "hello@kamaspa.id");
    assert.deepEqual(parsed.openingHours, ["Mon – Fri 10 AM – 8 PM", "Sat – Sun 9 AM – 9 PM"]);
    assert.equal(parsed.instagramUsername, "kama__spa");
    assert.equal(parsed.mapsEmbedUrl, EMBED);
    assert.equal(parsed.ga4MeasurementId, "G-ABCDEF1234");
    assert.equal(parsed.footerTagline, "Your ritual, your pace.");
    assert.equal(parsed.bookNowLabel, "Book Now");
    assert.deepEqual(parsed.menuScanUrls, [
      "https://cdn.example.com/menu-01.jpg",
      "https://cdn.example.com/img/menu-02.jpg",
    ]);
    const write = toSiteSettingsWrite(parsed);
    assert.equal(write.facebookUrl, null);
    assert.equal(write.phone, null);
    assert.ok(!("gscVerification" in write));
    assert.ok(!("faviconUrl" in write));
    assert.ok(!("defaultOgImageUrl" in write));
  });
  it("menolak field wajib kosong dan format salah", () => {
    const fail = (overrides: Partial<SiteSettingsInput>) =>
      assert.equal(siteSettingsInputSchema.safeParse(input(overrides)).success, false);
    fail({ address: " " });
    fail({ openingHours: ["", " "] });
    fail({ whatsappNumber: "" });
    fail({ whatsappNumber: "0812" });
    fail({ email: "bukan-email" });
    fail({ instagramUrl: "http://www.instagram.com/kama" });
    fail({ tiktokUrl: "https://www.instagram.com/kama" });
    fail({ freshaUrl: "fresha.com/kama" });
    fail({ mapsEmbedUrl: "https://maps.google.com/?q=kama" });
    fail({ instagramUsername: "kama spa" });
    fail({ ga4MeasurementId: "UA-1234" });
    fail({ phone: "12ab" });
    fail({ bookNowHref: "javascript:alert(1)" });
    fail({ menuScanUrls: ["bukan-url"] });
    fail({ menuPdfUrl: "javascript:alert(1)" });
  });
});

describe("mergeSiteSettings & tampilan publik", () => {
  it("tanpa baris → semua kosong (empty state, bukan konten hardcode)", () => {
    assert.deepEqual(mergeSiteSettings(null), emptySiteSettings());
  });
  it("baris DB diteruskan apa adanya ke tampilan publik", () => {
    const merged = mergeSiteSettings(CURRENT_ROW);
    assert.equal(merged.address, site.address);
    assert.deepEqual(merged.openingHours, [site.hours]);
    assert.equal(merged.whatsappNumber, CURRENT_ROW.whatsappNumber);
    assert.equal(merged.instagramUrl, site.instagram);
    assert.equal(merged.instagramUsername, "kama__spa");
    assert.equal(merged.tiktokUrl, site.tiktok);
    assert.equal(merged.mapsEmbedUrl, "");
    assert.equal(merged.freshaUrl, "");
  });
  it("kolom kosong atau tidak valid tetap kosong — tanpa nilai bawaan", () => {
    const merged = mergeSiteSettings({
      ...CURRENT_ROW,
      address: " ",
      openingHours: [],
      whatsappNumber: "abc",
      email: null,
      tiktokUrl: null,
      instagramUrl: "",
      instagramUsername: null,
    });
    assert.equal(merged.address, "");
    assert.deepEqual(merged.openingHours, []);
    assert.equal(merged.whatsappNumber, "");
    assert.equal(merged.email, "");
    assert.equal(merged.tiktokUrl, "");
    assert.equal(merged.instagramUrl, "");
    assert.equal(merged.instagramUsername, "");
  });
  it("alamat kosong tidak mengosongkan kartu cabang", () => {
    const applied = applySiteSettingsToLocations(locations, emptySiteSettings());
    assert.equal(applied[0].address, locations[0].address);
  });
  it("lokasi kontak identik dengan data statis untuk baris saat ini", () => {
    const applied = applySiteSettingsToLocations(locations, mergeSiteSettings(CURRENT_ROW));
    assert.deepEqual(applied, locations);
  });
  it("perubahan admin diterapkan ke lokasi", () => {
    const applied = applySiteSettingsToLocations(locations, {
      ...mergeSiteSettings(CURRENT_ROW),
      address: "Jl. Baru 1, Jakarta",
      openingHours: ["Mon – Fri 10 AM – 8 PM", "Sat 9 AM – 9 PM"],
      whatsappNumber: "6281200001111",
      mapsEmbedUrl: EMBED,
    });
    assert.equal(applied[0].address, "Jl. Baru 1, Jakarta");
    assert.equal(applied[0].mapDirections, directionsUrl("Jl. Baru 1, Jakarta"));
    assert.equal(applied[0].mapEmbed, EMBED);
    assert.equal(applied[0].hours, "Mon – Fri 10 AM – 8 PM\nSat 9 AM – 9 PM");
    assert.equal(applied[1].phone, "+62 812-0000-1111");
    assert.equal(applied[1].address, locations[1].address);
  });
  it("tautan rute statis sama dengan hasil directionsUrl", () => {
    assert.equal(directionsUrl(locations[0].address), locations[0].mapDirections);
  });
  it("ikon footer: urutan lama, Facebook hanya bila diisi", () => {
    const merged = mergeSiteSettings(CURRENT_ROW);
    assert.deepEqual(
      footerSocials(merged).map((s) => s.label),
      ["Instagram", "TikTok", "Email"],
    );
    assert.deepEqual(
      footerSocials({ ...merged, facebookUrl: "https://www.facebook.com/kama" }).map(
        (s) => s.label,
      ),
      ["Instagram", "TikTok", "Facebook", "Email"],
    );
    assert.deepEqual(
      footerSocials({ ...merged, tiktokUrl: "" }).map((s) => s.label),
      ["Instagram", "Email"],
    );
  });
});

describe("siteSettingsFormDefaults", () => {
  it("tanpa baris → form kosong + tanda noRow", () => {
    const defaults = siteSettingsFormDefaults(null);
    assert.equal(defaults.noRow, true);
    assert.equal(defaults.values.address, "");
    assert.deepEqual(defaults.prefilled, []);
  });
  it("kolom kosong diisi dari tampilan situs dan dicatat", () => {
    const defaults = siteSettingsFormDefaults(CURRENT_ROW);
    assert.equal(defaults.noRow, false);
    assert.equal(defaults.values.instagramUsername, "kama__spa");
    assert.deepEqual(defaults.prefilled, ["Username Instagram"]);
    assert.equal(defaults.values.facebookUrl, "");
  });
});
