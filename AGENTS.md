<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# KAMA Spa — project guide

Marketing site for KAMA Spa (South Jakarta). All UI copy is Indonesian. Next.js 16.4.3 App Router (Turbopack), React 19, TypeScript strict, Tailwind v4 (CSS-first config), FlyonUI 2.4.1.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build; also runs the TypeScript check
npm start            # serve the build
npx tsc --noEmit     # typecheck only
npm run test:e2e     # Playwright (builds + serves on :3311, then runs tests/)
```

There is **no** lint, format, or unit-test script, and no ESLint/Prettier config.
Verification = `npm run build` (it type-checks) + `npm run test:e2e` + a visual pass.

**Playwright** (`@playwright/test`, `playwright.config.ts`, `tests/`):

- The tests run against a **production build** on port **3311** (`npm run build && npx next start --port 3311`), never against the dev server — HMR makes interaction tests flaky. The dev server on :3000 may keep running alongside.
- Three projects: `mobile` 390×844, `tablet` 768×1024, `desktop` 1440×900.
- Run one project or one test: `npx playwright test --project=desktop`, `npx playwright test -g "mega menu"`.
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
- `src/components/navigation.tsx` — `"use client"`. Desktop mega menu (hover + click, Escape closes and returns focus) and the mobile drawer are hand-written React (state, body scroll lock). It only borrows FlyonUI *class names*; FlyonUI's JS is not running.
  - Header height comes from one token, `--kama-header-h` (`globals.css`, `@layer base`): the header, the drawer (`top-…`) and the page spacer all read it, so they cannot drift apart. Desktop nav appears at `xl` (1280px); below that it is the drawer.
  - Mega-menu content lives in `nav.megaGroups` (`src/data/content.ts`); `nav.primary` defines the header order (dropdown groups first).
- `src/components/icons.tsx` — all inline SVG icons. Add new icons there, not inline in pages.
- `src/lib/whatsapp.ts` — the only place that builds a `wa.me` URL (see `## Architecture decisions`).
- `src/components/reveal.tsx` — client component that reveals a block when it scrolls into view.
- `src/components/whatsapp-button.tsx` — the floating WhatsApp button (used by `src/app/layout.tsx`).
- `src/components/copyright-year.tsx` — client component that prints the current year.
- `src/components/home/reviews-carousel.tsx` — the swipeable reviews carousel.
- `src/components/home/hero.tsx` — server wrapper for the homepage hero/banners; `src/components/home/hero-slider.tsx` is the client hero media slider.
- `src/lib/domain/hero-slide.ts` — pure media URL validation + `HeroSlide` fallback/resolve rules (unit tested).
- `src/components/forms/*` — reservation + newsletter forms, wired to `POST /api/reservation` / `/api/newsletter` with admin inboxes (see `## Architecture decisions`). They take `{ branches, copy }` props; copy comes from `getFormsCopy()`.
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
- The menu page anchors are `#massage`, `#body`, `#face`, `#head`, `#bath`, `#packages`, `#gallery` — in that order, matching the mega menu. `additionalServices` (`AdditionalService[]`) carries the `category` + `anchor` that decide where each add-on is rendered.
- The fixed header clearance comes from **one** token, `--kama-header-h`: the header, the drawer, the page spacer (`Navigation`) and the anchor offset (`:where([id]) { scroll-margin-top: calc(var(--kama-header-h) + 1rem) }`) all read it. Never add a hardcoded header-sized padding: `.main-wrapper` has `padding-top: 0 !important` precisely because the Navigation spacer already reserves that space (a second offset is the classic "content starts too low" bug here).
- Files are split to **≤100 lines** (≤110 only when a split would be truly awkward): implementation lives in sibling modules (`foo.helpers.ts`, `foo.save.ts`, `foo-parts.tsx`, …) and the original path stays a **barrel** re-exporting the same public symbols, so imports never break. Server-action barrels must **not** carry `"use server"` — the directive belongs on each implementation module; a `"use server"` file may only export async functions defined in it, so re-exports there fail the build. Relative imports in chains reachable from `node --test` need explicit `.ts` extensions (`allowImportingTsExtensions` is on).
- Git: branch `main`, remote `origin` = `git@github.com:adamhavva/spa.git`, deploy target is Vercel.

## Architecture decisions

These are the decisions behind the 10-update batch (see `## Update backlog`). Keep them in sync with the code — if a rule below no longer matches the implementation, update this section instead of leaving it stale.

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
- Global SEO defaults: `SiteSettings.seoSiteName/seoDefaultTitle/seoDefaultDescription/seoOgDescription/seoOgLocale/seoTitleTemplate/seoKeywords[]`, edited in the SEO module; `layout.tsx generateMetadata` falls back to the constants in `src/lib/domain/seo.ts`.
- Footer hrefs: `SiteSettings.footerMembershipLearnHref/footerPrivacyHref/footerTermsHref`.
- Mega-menu highlights: `MenuItem.highlightBadge/highlightEyebrow` (root items only).
- Corporate photos: `CorporateContent.heroImageUrl/Alt`, `aboutImageUrl/Alt`, `inSpaImageUrl/Alt`.
- Microcopy, aria labels and CTA hrefs: `ContentBlock` registry `src/lib/domain/page-copy.ts` (groups include `links`, `microcopy`, `forms`). Server parents read `getPageCopy()`/`copy(blocks, key)`; client components receive strings via props. Placeholders are single-brace (`{n}`, `{m}`, `{name}`, `{title}`) and are replaced at render.

### Newsletter & reservation forms

- `NewsletterForm` (footer) and `ReservationForm` (`/contact`) take `{ branches, copy }` props (copy from `getFormsCopy()`, `src/lib/content/forms.ts`) and POST to `/api/newsletter` / `/api/reservation` → `NewsletterSignup` / `ReservationRequest` tables.
- Both routes follow the corporate-inquiry defense pattern: same-origin check, per-IP hashed rate limit, body size cap, honeypot + elapsed-time bot detection (fake success), zod validation (`src/lib/domain/forms.ts`). No Turnstile, no email.
- Admin inboxes: `/admin/newsletter` and `/admin/reservations` (reservations: status NEW/HANDLED, notes, delete).

### Maps

- `/contact` (`src/app/contact/contact-locations.tsx`) renders three things: a Leaflet/OpenStreetMap overview map of all branches (`src/components/contact/location-map.tsx`, centre = average branch coordinate), one `LocationInfo` card per branch, and an optional Google Maps iframe from `SiteSettings.mapsEmbedUrl`.
- Branches come from the database (`src/lib/content/branches`, type `Branch`), not `src/data`. Neither the OSM overview map nor the `embed?pb=...` iframe needs a **Maps API key**, so nothing needs billing.
- Per-branch "Dapatkan Rute" and WhatsApp links are built in `LocationInfo` from the branch row + `branchWhatsAppHref`; the flagship branch (`FLAGSHIP_LOCATION_SLUG`) also gets a Fresha booking link (`SiteSettings.freshaUrl`).
- There is **no `/locations` route and no `location-cards.tsx`** anymore. Older references to `locations[].mapEmbed`/`mapDirections` point at legacy seed data (`src/data/content/locations.ts`), not at the rendered embed.

### External links

- `nav.primary` entries may carry `external: true`. External items render as `<a target="_blank" rel="noopener noreferrer">` in **both** the desktop nav and the mobile drawer (never `next/link`).
- "Service Menu" is a Google Drive PDF (service/menu price list) and lives at the **end** of `nav.primary` — the dropdown groups must stay first (`tests/nav.spec.ts` asserts that exact order).
- Social + partnership live in `site.social`: Instagram `kama__spa`, TikTok `@kama__spa`, partnership email `marketing@kamaspa.id`. Facebook was dropped (no brand account).
- Icons for socials live in `src/components/icons.tsx` and must match the platform (Instagram / TikTok / envelope for email) — no generic globe/link glyphs.

### Motion and reveal

- `src/components/reveal.tsx` wraps content that should animate in on scroll (IntersectionObserver, one element per block).
- Anti-FOUC contract: content is **visible by default**. `src/app/layout.tsx` sets `document.documentElement.dataset.js = "true"` from a tiny inline script; CSS hides `.kama-reveal` **only** when that flag is present (`html[data-js="true"] .kama-reveal`). If JS fails, the page still shows everything.
- `prefers-reduced-motion: reduce` disables every animation (reveal, WhatsApp pulse, carousel auto-motion).
- Custom animations live in `src/app/kama.css` (or `@theme { --animate-* }` + `@keyframes` in `globals.css` for Tailwind v4 utilities) — never in `hiatus.css`.
- The reviews carousel (`src/components/home/reviews-carousel.tsx`) uses CSS scroll-snap so a native swipe works on touch devices; the arrows are an enhancement, not the only way to move.

### Homepage hero media

- `HeroSlide` is **media-only**: the hero text, eyebrow and CTA still come from the `HomepageSection` row with key `hero`; each slide supplies a photo or a video + poster.
- Fallback is deliberate: an **empty** `HeroSlide` table uses `HomepageSection.hero.imageUrl` (the admin banner form calls it the fallback image). Once any row exists, only published/valid rows render — all drafts means no hero media, not a silent return to the fallback.
- Initial rows (migration `20261109181254_hero_slides`): one video (`/video/incense-smoke.mp4` + `/img/kama/incense-smoke-poster.jpg`) and three photos (`01-incense`, `02-bottle-shadows`, `08-water-drop`). The old 27.9 MB GIF must not be re-added.
- Video is a **direct file URL** (`.mp4`/`.webm`, https or internal path), never a YouTube/Vimeo page. Poster is required; there is no video upload (image uploads stay image-only, max 4 MB).
- Autoplay is 6 s. It pauses on hover/focus inside the hero, when the tab is hidden, and under `prefers-reduced-motion` (which also disables the crossfade and video). There is intentionally no visible pause button; one slide renders no controls/autoplay.
- Admin CRUD lives at `/admin/homepage/hero` (`src/app/admin/actions/hero-slides.ts`). Saves must `updateTag(CONTENT_TAGS.homepage)` and revalidate `/`, `/admin/homepage`, `/admin/homepage/hero`; removed images are cleaned with `deleteImageByUrl`.
- `Reveal` does not forward event handlers, so the client slider wraps it in a pointer/focus-capture container. Keep the `data-hero-slide`/`data-active` hooks used by `tests/hero.spec.ts`.

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
