<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# KAMA Spa — project guide

Marketing site for KAMA Spa (South Jakarta). Visitor-facing copy is English; the admin dashboard (`/admin`) stays Indonesian. Next.js 16.4.3 App Router (Turbopack), React 19, TypeScript strict, Tailwind v4 (CSS-first config), FlyonUI 2.4.1.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build; also runs the TypeScript check
npm start            # serve the build
npx tsc --noEmit     # typecheck only
npm run test:unit    # node --test tests/unit/*.test.mts (pure domain logic)
npm run test:e2e     # Playwright (webServer builds + serves on :3311, then runs tests/*.spec.ts)
```

There is **no** lint or format script and no ESLint/Prettier config. Unit tests
(`npm run test:unit`) cover the pure domain modules; Playwright only loads
`*.spec.ts` (`testMatch`), so the two suites never overlap.
Verification = `npm run build` (it type-checks) + `npm run test:unit` + `npm run test:e2e` + a visual pass.

**Playwright** (`@playwright/test`, `playwright.config.ts`, `tests/`):

- The tests run against a **production build** on port **3311** (`npm run build && npx next start --port 3311`), never against the dev server — HMR makes interaction tests flaky. The dev server on :3000 may keep running alongside.
- Four projects: `mobile` 390×844, `tablet` 768×1024, `desktop` 1440×900, plus `admin-flows` (1440×900) which runs `admin-catalog.spec.ts` **last** (`dependencies` on the three viewport projects, which `testIgnore` it) so data-mutating admin tests don't race the header/footer specs.
- Run one project or one test: `npx playwright test --project=desktop`, `npx playwright test -g "mega menu"`. Through the npm script, pass flags after `--`: `npm run test:e2e -- --project=desktop`.
- Chromium is already in the Playwright cache; `npx playwright install chromium` only if the version changed.

Screenshot helper (writes `/tmp/kama-{mobile,tablet,desktop}.png` and prints each viewport's `scrollWidth` — use it to catch horizontal overflow):

```bash
node scripts/screenshot.mjs http://localhost:3000 /tmp/kama          # all viewports
node scripts/screenshot.mjs http://localhost:3000 /tmp/kama mobile   # one viewport
```


## Where things live

- `src/app/**/page.tsx` — one folder per route. Every page composes `<Navigation />` + `<Footer />` itself; there is no shared route layout.
- `src/app/menu/[slug]/page.tsx` — dynamic pages generated from `treatments` + `packages` via `generateStaticParams`.
- `src/data/content.ts` — site config, nav, footer links, treatments, packages, locations, journal posts, membership, testimonials.
- `src/data/pages.ts` — long-form page content (spa-101, membership, gift cards, careers, privacy policy, terms).
  - Trap: `membership` and `journalPosts` are exported from **both** data files. Check which one the page you are editing imports before changing data.
- `src/components/navigation.tsx` — **server component** (async): reads the menu from the `MenuItem` table via `getNavigationData()` and hands it to `navigation-client.tsx` (`"use client"`). Desktop mega menu (hover + click, Escape closes and returns focus) and the mobile drawer are hand-written React (state, body scroll lock). It only borrows FlyonUI *class names*; FlyonUI's JS is not running.
  - Header height comes from one token, `--kama-header-h` (`globals.css`, `@layer base`): the header, the drawer (`top-…`) and the page spacer all read it, so they cannot drift apart. Desktop nav appears at `xl` (1280px); below that it is the drawer.
  - Mega-menu content lives in `nav.megaGroups` (`src/data/content/nav-mega-groups.ts`); `nav.primary` (`src/data/content/nav.ts`) defines the header order: **Our Story · Service Menu (dropdown) · Gallery · Corporate Wellness (dropdown)**, with the **Book Now** CTA rendered *outside* the primary `<ul>` (desktop) and in the pinned drawer bar (mobile). `tests/nav.spec.ts` pins that exact order. The runtime menu is DB-driven and frozen (no admin menu editor) — see `### External links`.
  - Active/focus state: `src/lib/domain/nav-active.ts` (pure, unit-tested) derives the current item from `usePathname()`; the active link/trigger gets `aria-current="page"` + the `linkActive` utility (`navigation-styles.ts`). A mega group is active on its root route, any child route, or when a column link matches (e.g. `/membership` activates Service Menu). Focus-visible outlines already exist on every item.
- `src/components/icons.tsx` — all inline SVG icons. Add new icons there, not inline in pages.
- `src/lib/whatsapp.ts` — the only place that builds a `wa.me` URL (see `## Architecture decisions`).
- `src/components/reveal.tsx` — client component that reveals a block when it scrolls into view.
- `src/components/whatsapp-button.tsx` — the floating WhatsApp button (used by `src/app/layout.tsx`).
- `src/components/copyright-year.tsx` — client component that prints the current year.
- `src/components/home/reviews-marquee.tsx` — the reviews marquee (auto-scrolling, pauses on hover/focus/touch).
- `src/components/home/hero.tsx` — server wrapper for the homepage hero/banners; `src/components/home/hero-slider.tsx` is the client hero media slider.
- `src/lib/domain/hero-slide.ts` — pure media URL validation + `HeroSlide` fallback/resolve rules (unit tested).
- `src/components/forms/*` — reservation form, wired to `POST /api/reservation` with an admin inbox (see `## Architecture decisions`). It takes `{ branches, services, copy }` props (services = pilihan treatment/package dari `getReservationServices()`, copy dari `getFormsCopy()`) and is used by both `/contact` and `/reservation`. (The newsletter form only lives on the `feat/newsletter` branch.)
- `src/app/reservation/page.tsx` — public reservation page: tujuan CTA "Book Now" kartu putih hero dan tombol Book Now header/drawer (tidak ada lagi item menu "Reservation" terpisah di navigasi).
- `public/fonts`, `public/img`, `public/video` — locally hosted fonts (Faesa Breages for display, POI Carbonic for body/labels), imagery, and the hero video. `@font-face` rules live in `src/app/kama.css`; the old family names (`Romie trial`, `Ft regola neue trial`) are kept only as aliases because `hiatus.css` hardcodes them on legacy classes.
- `references/` — source PDFs (menu, colour reference). PDFs are gitignored.
- `.opencode/` — project tooling for opencode: `skills/` (nextjs-frontend, tailwind-kama-styling, kama-content-data, visual-verification), `agent/ui-reviewer`, `command/` (`/verify`, `/new-page`, `/new-treatment`, `/ui-review`), `plugins/kama-guardrails.js` (blocks edits to `hiatus.css`/`kama.css.bak`, protects the `@layer` order, enforces `<Navigation>`/`<main>`/`<Footer>` on route pages). See `.opencode/README.md`.

## Styling: three legacy stylesheets + Tailwind

`src/app/globals.css` sets the cascade explicitly:

```
@layer theme, base, legacy, components, utilities;
```

- `hiatus.css` — vendored, minified Webflow "Hiatus" design system (239 KB, one line). **Never reformat or hand-edit it**; it defines the legacy class names used across pages (`padding-global`, `container-large`, `layout-row gap-large`, `header-xxl`, `eyebrow-s`, `w-input`, …). It also still references the original blue/coral palette — KAMA overrides live in `kama.css`.
- `custom.css` — small additions to the Webflow sheet (RWD token overrides).
- `kama.css` — KAMA palette remap, fonts, and all project-specific overrides. **Put new CSS here**, not in `hiatus.css`/`custom.css`.
- Legacy sheets are imported into the `legacy` layer, so they beat the Tailwind reset but lose to Tailwind utilities and the `components` layer.

Conventions:
- Tailwind v4 is CSS-first: tokens live in the `@theme` block of `globals.css` (`--color-cocoa`, `--font-display`, breakpoints, type scale). `tailwind.config.js` is legacy leftover and is **not** loaded (no `@config` directive) — don't add tokens there.
- Breakpoints in `@theme` mirror the legacy max-width queries: `md` = 768px, `lg` = 992px, `xl` = 1280px.
- Buttons are the site's own `.btn` / `.btn-primary` / `.btn-outline` / `.btn-light` / `.btn-ghost` classes in `globals.css` (`@layer components`). FlyonUI's `button` component is deliberately excluded (`@plugin "flyonui" { exclude: ["button"] }`) — don't switch to `btn btn-primary` FlyonUI markup.
- New markup should use Tailwind utilities; reuse existing legacy class names for page furniture rather than inventing new ones.
- `public/flyonui.js` is a byte-identical copy of `node_modules/flyonui/flyonui.js` and is currently **not loaded** by any page. If you need FlyonUI's JS components (collapse, drawer), you must add the script tag yourself.

## Gotchas

- `next.config.ts` enables `cacheComponents: true` (Cache Components), `partialPrefetching: true`, `reactCompiler: true` (React Compiler runs via `babel-plugin-react-compiler`). Dynamic APIs need explicit handling under Cache Components — check `node_modules/next/dist/docs/` before adding dynamic data.
- `next dev` rewrites the managed block at the top of this file. Keep it byte-identical or every dev run produces a diff.
- `opencode.json` is gitignored but holds a hardcoded provider API key — never commit it or paste it into files.
- The menu page anchors are `#massage`, `#body`, `#face`, `#head`, `#bath`, `#packages`, `#gallery` — in that order. The Service Menu dropdown links `#massage` (Body Massage + Chair Services), `#body` (Add Ons) and `#packages` (All Day Spa Packages); `#face`/`#head`/`#bath` are reached from the footer, not the header. `additionalServices` (`AdditionalService[]`) carries the `category` + `anchor` that decide where each add-on is rendered.
- The fixed header clearance comes from **one** token, `--kama-header-h`: the header, the drawer, the page spacer (`Navigation`) and the anchor offset (`:where([id]) { scroll-margin-top: calc(var(--kama-header-h) + 1rem) }`) all read it. Never add a hardcoded header-sized padding: `.main-wrapper` has `padding-top: 0 !important` precisely because the Navigation spacer already reserves that space (a second offset is the classic "content starts too low" bug here).
- Files are split to **≤100 lines** (≤110 only when a split would be truly awkward): implementation lives in sibling modules (`foo.helpers.ts`, `foo.save.ts`, `foo-parts.tsx`, …) and the original path stays a **barrel** re-exporting the same public symbols, so imports never break. Server-action barrels must **not** carry `"use server"` — the directive belongs on each implementation module; a `"use server"` file may only export async functions defined in it, so re-exports there fail the build. Relative imports in chains reachable from `node --test` need explicit `.ts` extensions (`allowImportingTsExtensions` is on).
- Git: branch `main`, remote `origin` = `git@github.com:adamhavva/spa.git`, deploy target is Vercel.

## Architecture decisions

These are the decisions behind the 10-update batch (see `## Update backlog`). Keep them in sync with the code — if a rule below no longer matches the implementation, update this section instead of leaving it stale.

### Language policy

Visitor-facing copy is **English only**; the admin dashboard (`/admin`) stays Indonesian. This covers navigation, buttons, labels, membership promotion, service descriptions, footer, microcopy, aria labels, visitor form validation, SEO defaults and WhatsApp built-in messages.

- **Proper names are retained**: Samādhāna/Samådhåna, Dhāranā/Dhåranå, Āroha/Åroha, Karuna, KAMA, Sukma Laya, Urip Padma, Skogsrå, and branch addresses. Translate descriptive copy, never names or addresses. Footer copy is professionally edited English, not word-for-word translation.
- **Currency**: full IDR numeric notation with comma grouping and the `Rp` prefix ("Rp 1,500,000", "Rp 145,000") — never "Rp 1.5 million" or "1.5jt". Menu-card shorthand ("145k", "60 min") stays (international).
- **Membership is a monthly-credit model, not points/rewards**: copy reflects one essential-service credit per month, member prices across the menu, and member-only offers. The canonical intro is shared verbatim by `MembershipProgram.intro`, `SiteSettings.footerTagline` and the `promos.membership.hero_description` ContentBlock; tiers are Individual / Family / KAMA Team.
- **Frozen vs admin-editable surfaces**: frozen copy (ContentBlock, MenuItem, Branch, PageSeo, StaticPage title, SiteSettings SEO fields) has no admin editor → migrations UPDATE it unconditionally by key/id/path. Admin-editable copy (WhatsApp templates, HomepageSection, membership, catalog, journal, gallery, events, retail, promos, gift card, corporate, our-story, footer/contact settings) is updated with a guard on the exact old live value so admin edits are never clobbered.
- **Seed + migration pairing**: runtime copy is DB-driven, so a seed change alone never reaches production. Every visitor-copy change lands in both the seed (`scripts/seed*.mts`, `src/data`) and an idempotent SQL migration. The English conversion is migration `20261127090000_english_visitor_copy`, generated by `scripts/generate-english-copy-migration.mts` from `scripts/english-copy/collect.mts` (canonical rows) paired against live/HEAD old values; `scripts/english-copy/rollback.sql` reverses it. `scripts/inventory-visitor-copy.mts` dumps live copy read-only for the residual scan. Trap: the page-copy reader has **no static fallback** — a ContentBlock key absent from the live DB renders empty, so the migration must INSERT missing keys (generator `missing.json` input), not just UPDATE them; `ContentBlock.updatedAt` is NOT NULL without a DB default, so every INSERT needs `now()`.
- **Bilingual parsers stay**: `parseDurationLabel` (hours?|jam, min|menit) and `parsePriceLabel` (k|rb|jt|million|m) remain bilingual permanently so admin can still type Indonesian labels; only formatters render English.
- **Stay Indonesian**: admin labels/hints in the page-copy registry and WA context definitions, admin validation messages, code comments, test names, internal logs, staff emails, and machine-to-machine endpoints (backup/report).

### WhatsApp is the single contact channel — fully DB-driven

Numbers and messages live in the database (`SiteSettings` + `WhatsAppTemplate`), edited in Kontak & Umum. There are **no hardcoded number/message constants** anymore.

- `src/lib/whatsapp.ts` is the **only** place that builds a `wa.me` URL: `waLink(message, number)`, `toWaNumber(raw)`, `corporateWhatsApp(pic, site, message)`. Never hardcode a `wa.me` link in a page.
- Pages use the async readers in `src/lib/content/whatsapp.ts` instead:
  - `whatsAppHref(context, { custom, values })` — resolves the context template (a per-item `custom` message wins) + the configured number.
  - `branchWhatsAppHref({ address, whatsappNumber })` — per-branch link, `location` context.
  - `corporateWhatsAppHref(picPhone)` — the "Talk to Roy" line on `/corporate`.
  - All return `null` when no number is configured → **hide the button**, never render a fake number.
- Context registry: `WHATSAPP_CONTEXTS` (`src/lib/domain/whatsapp-template.contexts.ts`) — 9 contexts: `default`, `treatment`, `package`, `promo`, `gift`, `membership`, `retail`, `location`, `event`. Placeholders are double-brace (`{{address}}`, `{{event}}`, …). The admin template page iterates the registry, so new contexts appear automatically.
- Every phone number rendered on the site is a WhatsApp link, **not** a `tel:` link.
- Membership CTAs ("Join KAMA Now", "Join Now") use the `membership` template; they no longer link to `/contact`.

### Admin-editable brand, SEO & microcopy

- Brand: `SiteSettings.logoMarkLightUrl/logoMarkDarkUrl/logoLockupUrl`, `brandWordmarkTop/Bottom`, `brandLogoAlt` — consumed by the logo, footer lockup, hero slider and admin login, with the local `public/img/kama` assets as fallbacks.
- SEO is **fully automatic — there is no SEO admin module** (the whole "Halaman & Navigasi" group — Halaman & URL, Teks Halaman, Cabang, SEO — was removed from the dashboard). Next Metadata API does the work: `src/app/layout-metadata.ts generateRootMetadata` reads `SiteSettings.seoSiteName/seoDefaultTitle/seoDefaultDescription/seoOgDescription/seoOgLocale/seoTitleTemplate/seoKeywords[]` and falls back to the constants in `src/lib/domain/seo.ts`; per-page metadata comes from `withPageSeo` (`src/lib/content/seo.queries.ts`, `PageSeo` rows are DB-managed). Per-route code defaults (title/description/keywords) live in `PAGE_SEO_DEFAULTS` (`src/lib/domain/seo.pages*.ts`, one entry per `PUBLIC_STATIC_ROUTES` path): `mergePageSeo` fills any gap when a page passes empty defaults, and dynamic routes inherit via longest-prefix match (`/treatments/massage/x` → `/treatments`). Keywords per page = explicit `keywords` in the page's defaults, else route keywords + global keywords (`SiteSettings.seoKeywords` or `FALLBACK_KEYWORDS`) deduped case-insensitively, capped at `MAX_PAGE_KEYWORDS` (12). Precedence everywhere: `PageSeo` DB override → page explicit defaults → route registry → root defaults. `/robots.txt` is `src/app/robots.ts` (blocks `/admin` + `/api`, noindex on staging via `SEO_NOINDEX=1`/Vercel preview) and `/sitemap.xml` is `src/app/sitemap.ts` (generated from the DB). `gscVerification`, `faviconUrl` and `defaultOgImageUrl` have **no editor UI** — existing DB values keep working, empty values fall back.
- Footer hrefs: `SiteSettings.footerMembershipLearnHref/footerPrivacyHref/footerTermsHref`.
- Mega-menu highlights: `MenuItem.highlightBadge/highlightEyebrow` (root items only).
- Corporate photos: `CorporateContent.heroImageUrl/Alt`, `aboutImageUrl/Alt`, `inSpaImageUrl/Alt`.
- Microcopy, aria labels and CTA hrefs: `ContentBlock` registry `src/lib/domain/page-copy.ts` (groups include `links`, `microcopy`, `forms`). Server parents read `getPageCopy()`/`copy(blocks, key)`; client components receive strings via props. Placeholders are single-brace (`{n}`, `{m}`, `{name}`, `{title}`) and are replaced at render. Values are seed/migration-managed — the `/admin/page-copy` editor no longer exists.

### Reservation form (newsletter lives only on `feat/newsletter`)

- `ReservationForm` (used by `/contact` **and** `/reservation`) takes `{ branches, services, copy }` props (copy from `getFormsCopy()`, `src/lib/content/forms.ts`; services from `getReservationServices()`, `src/lib/content/reservation.ts`) and POSTs to `/api/reservation` → `ReservationRequest` table. There is no newsletter form, `/api/newsletter` route, or `/admin/newsletter` inbox on `main`; the `NewsletterSignup` Prisma model stays in the schema so the shared table/data is not dropped.
- Fields: nama, telepon, email, cabang, jenis treatment (select optgroup per kategori + grup "Packages"), tanggal, jam, jumlah orang, catatan. Jadwal & layanan disimpan di `ReservationRequest.preferredDate` ("YYYY-MM-DD"), `preferredTime` ("HH:MM"), `treatment` (nama tampil, bukan slug — inbox tetap terbaca walau treatment diganti) dan `guests` (6 = "6+"); detail admin merendernya lewat `src/app/admin/reservations/reservation-detail-list.tsx`.
- The route follows the corporate-inquiry defense pattern: same-origin check, per-IP hashed rate limit, body size cap, honeypot + elapsed-time bot detection (fake success), zod validation (`src/lib/domain/forms.ts`). No Turnstile, no email. The elapsed timer is set in `useEffect` (not render) so Cache Components prerender does not freeze `Date.now()`.
- Admin inbox: `/admin/reservations` (status NEW/HANDLED, notes, delete).
- Public page `/reservation` is the destination of the hero white-card "Book Now" CTA and the header/drawer Book Now button (`SiteSettings.bookNowHref`, default `/reservation`). The standalone "Reservation" header item added by `20261116150000_public_reservation` was later removed by `20261126090000_nav_restructure`. Migrations: `20261116150000_public_reservation` (columns, menu item, CTA/Book Now retarget, label form baru) and `20261116160000_reservation_form_copy` (guarantees the `forms.reservation.*` ContentBlocks — deploys never run `seed-content.mts`, so copy that only lives in the seed would render empty). Visitor-facing form copy (`forms.reservation.*`) is English since `20261127090000_english_visitor_copy`; the field names above describe the admin inbox, which stays Indonesian.

### Maps

- `/contact` (`src/app/contact/contact-locations.tsx`) shows only the **first branch** in admin order (`branches.slice(0, 1)` in `page.tsx`; the other branches stay selectable on `/reservation`): one `LocationInfo` card beside a Leaflet/OpenStreetMap map — card left, map right at `lg`, stacked below (`src/components/contact/location-map.tsx`, centre = average branch coordinate, zoom 15 for a single location) — plus an optional Google Maps iframe from `SiteSettings.mapsEmbedUrl`. The reservation form on `/contact` receives the same single branch. Section title is singular "Our Location" (seed + migration `20261127120000_contact_single_location`).
- Branches come from the database (`src/lib/content/branches`, type `Branch`), not `src/data`; rows are DB-managed (the `/admin/branches` editor was removed). Neither the OSM overview map nor the `embed?pb=...` iframe needs a **Maps API key**, so nothing needs billing.
- Per-branch "Dapatkan Rute" and WhatsApp links are built in `LocationInfo` from the branch row + `branchWhatsAppHref`; the flagship branch (`FLAGSHIP_LOCATION_SLUG`) also gets a Fresha booking link (`SiteSettings.freshaUrl`).
- There is **no `/locations` route and no `location-cards.tsx`** anymore. Older references to `locations[].mapEmbed`/`mapDirections` point at legacy seed data (`src/data/content/locations.ts`), not at the rendered embed.

### External links

- `nav.primary` entries may carry `external: true`. External items render as `<a target="_blank" rel="noopener noreferrer">` in **both** the desktop nav and the mobile drawer (never `next/link`). There are currently **no** external items in the header — the old Google Drive "Service Menu" PDF link was removed.
- **Header structure (frozen, DB-driven).** The admin menu editor was removed, so the runtime menu comes from the `MenuItem` table (`getNavigationData()` falls back to an *empty* nav, never the seed). Any structural change must land in **both** the static seed (`src/data/content/nav.ts` + `nav-mega-groups.ts`, used by fresh DBs and the unit parity tests) **and** an idempotent SQL migration for existing DBs. The current order — pinned by `tests/nav.spec.ts` — is:
  1. **Our Story** → `/our-story` (plain link).
  2. **Service Menu** → `/menu`, mega group `services`: one column "Services" listing, in order, **Body Massage** (`/menu#massage`), **Chair Services** (`/menu#massage`), **Add Ons** (`/menu#body`), **All Day Spa Packages** (`/menu#packages`), **Loyalty Member** (`/membership`), plus the membership highlight card and a "View all treatments" footer link.
  3. **Gallery** → `/gallery` (plain link; also in the footer About group).
  4. **Corporate Wellness** → `/corporate`, mega group `corporate` (content unchanged).
  5. **Book Now** → CTA from `SiteSettings.bookNowLabel/bookNowHref` (default `/reservation`), rendered *outside* the primary `<ul>` on desktop and in the pinned drawer bar on mobile — never a primary `<li>`.
- Contact and the standalone Reservation item are **no longer top-level header entries** (the footer is untouched). Migration `20261126090000_nav_restructure` deletes the `/contact`, `/reservation` and `drive.google.com` header roots, rebuilds the `services` children, adds Our Story, reorders the roots and backfills the Book Now CTA. It early-returns on an empty DB (so `scripts/seed.mts` still seeds fresh databases) and is idempotent on re-run. Earlier migrations: `20261116090000_menu_gallery_link` (Gallery), `20261116150000_public_reservation` (Reservation, since removed).
- Active/focus state is documented under `src/components/navigation.tsx` in `## Where things live` (`nav-active.ts` + `aria-current="page"`).
- Social + partnership live in `site.social`: Instagram `kama__spa`, TikTok `@kama__spa`, partnership email `marketing@kamaspa.id`. Facebook was dropped (no brand account).
- Icons for socials live in `src/components/icons.tsx` and must match the platform (Instagram / TikTok / envelope for email) — no generic globe/link glyphs.

### Motion and reveal

- `src/components/reveal.tsx` wraps content that should animate in on scroll (IntersectionObserver, one element per block).
- Anti-FOUC contract: content is **visible by default**. `src/app/layout.tsx` sets `document.documentElement.dataset.js = "true"` from a tiny inline script; CSS hides `.kama-reveal` **only** when that flag is present (`html[data-js="true"] .kama-reveal`). If JS fails, the page still shows everything.
- `prefers-reduced-motion: reduce` disables every animation (reveal, WhatsApp pulse, carousel auto-motion).
- Custom animations live in `src/app/kama.css` (or `@theme { --animate-* }` + `@keyframes` in `globals.css` for Tailwind v4 utilities) — never in `hiatus.css`.
- The reviews section is a marquee (`src/components/home/reviews-marquee.tsx`): the track scrolls continuously and pauses on hover/focus/touch; `prefers-reduced-motion` turns it into a static swipeable list (duplicate copy hidden). When there are no published reviews the whole section — heading included — is hidden.

### Homepage hero media

- `HeroSlide` is **media-only**: the hero text, eyebrow and CTA still come from the `HomepageSection` row with key `hero`; each slide supplies a photo or a video + poster.
- Fallback is deliberate: an **empty** `HeroSlide` table uses `HomepageSection.hero.imageUrl` (the admin banner form calls it the fallback image). Once any row exists, only published/valid rows render — all drafts means no hero media, not a silent return to the fallback.
- Initial rows (migration `20261109181254_hero_slides`): one video (`/video/incense-smoke.mp4` + `/img/kama/incense-smoke-poster.jpg`) and three photos (`01-incense`, `02-bottle-shadows`, `08-water-drop`). The old 27.9 MB GIF must not be re-added.
- Video is a **direct file URL** (`.mp4`/`.webm`, https or internal path), never a YouTube/Vimeo page. Poster is required; there is no video upload (image uploads stay image-only, max 4 MB).
- Autoplay is 6 s. It pauses on hover/focus inside the hero, when the tab is hidden, and under `prefers-reduced-motion` (which also disables the crossfade and video). There is intentionally no visible pause button; one slide renders no controls/autoplay.
- Admin CRUD lives at `/admin/homepage/hero` (`src/app/admin/actions/hero-slides.ts`). Saves must `updateTag(CONTENT_TAGS.homepage)` and revalidate `/`, `/admin/homepage`, `/admin/homepage/hero`; removed images are cleaned with `deleteImageByUrl`.
- `Reveal` does not forward event handlers, so the client slider wraps it in a pointer/focus-capture container. Keep the `data-hero-slide`/`data-active` hooks used by `tests/hero.spec.ts`.

### Instagram feed = embed postingan (bukan unggahan foto)

- `/admin/homepage/instagram` manages **post URLs only**: `InstagramPost.postUrl` stores the canonical `https://www.instagram.com/{p|reel|tv}/{code}/` (migration `20261116090000_instagram_embed` dropped `imageUrl`/`imageAlt`/`href`). The form is a single URL field — no upload, no Media Library entry (`media.columns.ts` has no instagramPost row anymore), and the "Salin 12 foto bawaan" import action is gone.
- `normalizeInstagramPostUrl` (`src/lib/domain/homepage.instagram.ts`) accepts http/https, `www.`, `/reels/`, and trailing query/fragment; `selectInstagramPosts` drops invalid rows, dedupes, caps at `INSTAGRAM_LIMITS.max`, and builds `embedUrl` (`postUrl` + `embed`).
- The homepage Socials section renders `src/components/home/instagram-embeds.tsx`: official Instagram embed iframes (`…/embed`, `loading="lazy"`, fixed height) in a 1/2/3-column grid. `InstagramGrid` (square photo cells) now serves only the Gallery Teaser's live Graph-API feed / gallery photos.
- Duplicates are rejected on save by comparing canonical URLs; a post deleted/privated on Instagram shows Instagram's own fallback inside the iframe.

### Rich text & image placement (Google-Docs-style)

- All admin rich text goes through `RichTextField` (visual contentEditable / raw HTML / preview). Saved HTML must pass `richTextInput`/`sanitizeHtml`; public pages render it with `<RichText>` (`src/components/rich-text.tsx`, `.kama-prose` styles in `kama.css`) — never `dangerouslySetInnerHTML` directly.
- Image placement: the toolbar's ◧ Kiri / ◨ Kanan / Tengah / Blok buttons set `kama-img-left|right|center` classes on the selected `<img>` (`src/app/admin/rich-text-image.ts`). Those are the **only** class values the sanitizer keeps — the allowlist is `LAYOUT_CLASSES` (`src/lib/domain/rich-text-layout.ts`), allowed on `img`/`figure` only. Floats live under `.kama-prose` in `kama.css`; below `md` they fall back to full-width blocks.
- `/gallery` renders `GalleryAlbum.description` as rich HTML via `PublicSectionHeader` → `RichText` — don't flatten it back to `toPlainText`.

### Card consistency (the anti-jomplang rule)

Every card in a grid must:

1. fill its cell: `height: 100%` on the card root and `min-width: 0` (prevents Android overflow),
2. push its footer to the bottom: body `flex: 1` + CTA `margin-top: auto`,
3. stay centred: grid `justify-items: center` + the card `margin-inline: auto` when it has a max width.

Card families that must obey this together: `.treatment-card`, `.package-card`, `.location-card_component`, `.contact-card`, `.benefits_card`, `.whats-new_card`, `.review_card`. A new card family must be added to this list when it is introduced.

### Visitor analytics (first-party, no GA dependency)

- `PageView` rows are written two ways: `src/proxy.ts` records full public document loads (via `src/lib/analytics/track.ts`, `event.waitUntil`), and `src/instrumentation-client.ts` sends a beacon to `/api/analytics/view` for App Router client-side navigations. Proxy cannot detect Next prefetch — Next strips `next-router-prefetch`/RSC headers before middleware — so it only accepts `Accept: text/html` documents.
- The request rules live in `src/lib/domain/page-view.ts` (pure/tested): GET/document only, public pages only, no `/admin`, API, assets, bots, or prefetch. A failed insert logs a warning and never delays or breaks the page.
- A random visitor ID (UUID) is stored in the httpOnly cookie `kama_visitor_id` (set by the proxy or the beacon route); no IP or User-Agent is persisted. Requests carrying the admin session cookie are not counted. Clearing the cookie counts as a new visitor.
- Dashboard shows unique visitors + page views for the last 30 days; the separate module **Pengunjung & Halaman** (`/admin/analytics`, group `analitik`) shows 7/30/90-day charts and the top-50 page table.
- Aggregates are raw SQL in `src/lib/analytics/report.ts`; day buckets use the WIB calendar in `src/lib/domain/traffic.ts`. Never sum daily unique visitors to claim a period total — the period total is its own `COUNT(DISTINCT visitorId)` query.
- GA4 (optional, Measurement ID in Kontak & Umum) is a separate layer and is not required for these reports.

## Update backlog

- [x] **U1** WhatsApp templates: per-location, generic, member join (`src/lib/whatsapp.ts`).
- [x] **U2** Instagram / TikTok / partnership email + navbar "Service Menu" (new tab) with matching icons.
- [x] **U3** `/locations` shows map embeds with a marker per branch instead of photos.
- [x] **U4** Every phone number opens WhatsApp with the matching template.
- [x] **U5** Footer partnership text is a `mailto:` to `marketing@kamaspa.id`.
- [x] **U6** Copyright year follows the current year automatically.
- [x] **U7** Reviews on the homepage are a swipeable carousel (mobile + desktop).
- [x] **U8** Floating WhatsApp button uses the brand glyph and has an animation.
- [x] **U9** Content reveals block by block while scrolling, with animation.
- [x] **U10** All cards are consistent: equal height, aligned buttons, centred on every device.

Verification for a change in this area: `npm run build` (type-checks) + `npm run test:e2e` + `node scripts/screenshot.mjs http://localhost:3000 /tmp/kama` (mobile/tablet/desktop) to catch horizontal overflow and card misalignment.

<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, porting code between libraries, platforms, or SQL dialects, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, debugging, or reviewing code that does not depend on a library or platform API, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and what to look up in the library's documentation, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and what to look up in the library's documentation (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs
<!-- context7 -->
