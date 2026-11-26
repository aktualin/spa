# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read AGENTS.md first

`AGENTS.md` (checked in, auto-loaded as project instructions) is the exhaustive source of truth: per-module architecture decisions, the styling cascade, card-consistency rules, WhatsApp/SEO/hero/Instagram contracts, and the update backlog. **This file is only the orientation layer** — commands and the big-picture data flow that spans many files. When the two disagree, AGENTS.md wins; update it rather than letting it go stale.

> **This is NOT the Next.js you know.** Next 16.4.3 has breaking changes vs. training data. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices. `next dev` rewrites the managed block at the top of AGENTS.md — keep it byte-identical or every dev run produces a diff.

KAMA Spa (South Jakarta) marketing site + DB-driven admin CMS. All UI copy is Indonesian. Next.js 16 App Router (Turbopack), React 19, TypeScript strict, Tailwind v4 (CSS-first), FlyonUI 2.4.1 (class names only — its JS is not loaded). Prisma 7 on Supabase Postgres, S3-compatible Supabase Storage for media. Deploy target: Vercel; remote `origin` = `git@github.com:adamhavva/spa.git`, branch `main`.

## Commands

```bash
npm run dev          # dev server (default :3000; use another port if occupied)
npm run build        # prisma generate && next build — also runs the TypeScript check
npm start            # serve the production build
npx tsc --noEmit     # typecheck only
npm run test:unit    # node --test tests/unit/*.test.mts (pure domain logic)
npm run test:e2e     # Playwright: builds + serves on :3311, then runs tests/*.spec.ts
npm run screenshot   # node scripts/screenshot.mjs <url> <outPrefix> [viewport]
```

There is **no lint, format, or ESLint/Prettier config**. Verification = `npm run build` (type-checks) + `npm run test:unit` + `npm run test:e2e` + a visual pass.

- Single e2e test / project: `npx playwright test --project=desktop`, `npx playwright test -g "mega menu"`. Projects: `mobile` 390×844, `tablet` 768×1024, `desktop` 1440×900, plus `admin-flows` (menu/catalog specs run last, after the others). E2E always runs against a **production build on :3311**, never the dev server (HMR makes interaction tests flaky).
- Single unit test: `node --test tests/unit/hero-slide.test.mts`. Playwright only matches `*.spec.ts`; unit tests are `*.test.mts` (different loader).
- Screenshot helper prints each viewport's `scrollWidth` — use it to catch horizontal overflow: `node scripts/screenshot.mjs http://localhost:3000 /tmp/kama`.

### Database / admin bootstrap (no npm scripts — run directly)

Prisma CLI reads `.env` via `prisma.config.ts`. `prisma generate` runs automatically on `postinstall` and `build`.

```bash
npx prisma migrate dev      # create/apply migrations locally (uses DIRECT_URL :5432)
npx prisma migrate deploy   # apply migrations in production/CI
node scripts/seed.mts       # idempotent upsert of src/data/* into the DB (never deletes)
node scripts/create-admin.mjs <email> <password> [ADMIN|EDITOR] [nama]
```

`scripts/seed-content.mts` seeds only admin-editable content that is still empty (never overwrites dashboard edits). Deploys do **not** run seeds — copy that must exist in production is guaranteed by a migration, not by `seed-content.mts`. Other `scripts/*.mts` are one-off S3/URL migrations and checks; they import `./load-env.mts` first so `asset()` resolves before site data is evaluated.

### Environment

All env lives in **`.env`** (gitignored); `.env.example` is the committed template. Do not use `.env.local`. Required: `DATABASE_URL` (transaction pooler :6543, runtime), `DIRECT_URL` (:5432, migrate), `DATABASE_SCHEMA` (KAMA shares a Supabase project, so its tables live in their own schema, not `public`), `ADMIN_SESSION_SECRET`, and the `SUPABASE_S3_*` / `NEXT_PUBLIC_SUPABASE_PUBLIC_URL` storage vars. Optional: Turnstile (corporate inquiry, fail-closed in prod), Resend email, Instagram Graph feed, GitHub backup. Secrets also sit in `.claude/settings.local.json` (gitignored) — never commit or paste them.

## Architecture (the big picture)

### Layering inside `src/lib`

- `src/lib/domain/*` — **pure, unit-tested logic** (validation, schemas, formatting, resolve rules). No DB/Next imports; this is what `tests/unit/*.test.mts` covers.
- `src/lib/content/*` — **async DB readers** for public pages. Each wraps queries in `safeQuery` (`src/lib/safe-query.ts`) so a DB outage returns static fallback data from `src/data/*` instead of throwing — *browsing never breaks totally even if the DB is down*.
- `src/lib/*` (top level) — infrastructure: `prisma.ts`, `storage.ts`, `auth.ts`/`session.ts`, `redirects.ts`, `email.ts`, `media.ts`, `asset-url.ts`, `db-schema.ts`, `whatsapp.ts`.
- `src/data/*` — static seed/fallback content (`content.ts`, `pages.ts`). Trap: `membership` and `journalPosts` are exported from **both** data files; check which one a page imports before editing.

### Data flow & caching (Cache Components)

`next.config.ts` enables `cacheComponents`, `partialPrefetching`, `reactCompiler`. Public reads use `"use cache"` + `cacheTag(CONTENT_TAGS.*)` (`src/lib/content/tags.ts`). **Every admin Server Action that writes a table must call `updateTag(tag)`** (and revalidate the affected paths) or public pages keep showing stale data. The tag map documents which models each tag covers.

### Database access

Prisma 7 no longer reads `url` from `schema.prisma` — runtime connects through the `PrismaPg` driver adapter (`src/lib/prisma.ts`) using `DATABASE_URL` (pooler). The client is cached on `globalThis` in dev to avoid exhausting the pooler on hot reload; transaction timeouts are raised because the DB is in another region. **Raw SQL must use `dbTable("Model")`** (`src/lib/db-schema.ts`) to stay in `DATABASE_SCHEMA` and never fall through to `public`. Prices are stored as full rupiah `Int` (no decimals).

### Request pipeline — `src/proxy.ts`

Next 16's replacement for middleware (split into `proxy.admin`, `proxy.redirect`, `proxy.not-found*`, `proxy.helpers`). In order: guard `/api/admin/*` and `/preview/*` (admin JWT); for public paths apply DB-driven redirects (in-memory TTL cache, `src/lib/redirects.ts`), then 404 for unknown pages / inactive promos / hidden journal posts / unpublished events; only genuinely rendered public pages are counted for analytics (`trackPageView`, `event.waitUntil`). Client-side App Router navigations are counted separately by a beacon from `src/instrumentation-client.ts` → `/api/analytics/view`. Analytics is first-party (`PageView` rows, WIB day buckets); no IP/User-Agent persisted; GA4 is optional and separate.

### Admin auth

`jose` HS256 JWT in cookie `kama_admin_session` (8h), signed with `ADMIN_SESSION_SECRET`. Roles `ADMIN`/`EDITOR`; `sessionVersion` is bumped on password/role/status change to invalidate old sessions; login lockout (`failedLoginCount`/`lockedUntil`) and forced `mustChangePassword`. Passwords are scrypt (`src/lib/password.ts`). **The proxy only verifies the JWT** — DB session/role checks live in `src/lib/auth.ts`, and every admin page/Server Action must call `requireSession()`/`requireRole()` itself (actions can be invoked directly, bypassing the proxy). Admin routes are `no-store` + `noindex` (headers in `next.config.ts`). 14 modules under `/admin`; several editors were intentionally removed (SEO, menu navigation, branches, page-copy) — that structure is frozen/DB-driven.

### Media & assets

All site images (including the logo) are served from the **public S3 bucket `vip-book`** (Supabase Storage), not `public/`. `asset(key)` (`src/lib/asset-url.ts`) builds the URL; `NEXT_PUBLIC_ASSET_BASE_URL` is inlined at build by `next.config.ts` from the storage config, so it is safe in client components. Uploads go through `/api/admin/upload` (image-only, max 4 MB, client-side compression). `public/fonts`, `public/video` and local `public/img/kama` remain as fallbacks.

### Public routes

One folder per route under `src/app/**/page.tsx`; **each page composes `<Navigation />` + `<Footer />` itself** — there is no shared route layout. `src/app/[slug]/page.tsx` renders DB-driven `StaticPage` rows (no `generateStaticParams`, so an empty table can't fail the build); `/menu/[slug]` and similar dynamic routes generate from the catalog. SEO is fully automatic via the Metadata API (`layout-metadata.ts`, `withPageSeo`, `PAGE_SEO_DEFAULTS`); `robots.ts`/`sitemap.ts` are generated from the DB. WhatsApp is the single contact channel — `src/lib/whatsapp.ts` is the only place that builds a `wa.me` URL; readers return `null` when no number is configured, so the button is hidden rather than faked.

### Styling cascade

`globals.css` declares `@layer theme, base, legacy, components, utilities;`. Three legacy sheets are imported into `legacy`: `hiatus.css` (vendored minified Webflow system — **never reformat or hand-edit**), `custom.css`, and `kama.css` (**all new CSS goes here**). Tailwind v4 is CSS-first: tokens live in the `@theme` block of `globals.css`; `tailwind.config.js` is a leftover and is **not loaded**. Buttons are the site's own `.btn*` classes (FlyonUI's button component is excluded). Header clearance comes from one token, `--kama-header-h` — never hardcode a header-sized padding. See AGENTS.md for the card-consistency ("anti-jomplang") rule and motion/reveal contracts.

## File-splitting convention

Files are kept to **≤100 lines** (≤110 only when a split is truly awkward). Implementation lives in sibling modules (`foo.helpers.ts`, `foo-parts.tsx`, …) and the original path stays a **barrel** re-exporting the same public symbols, so imports never break. Server-action barrels must **not** carry `"use server"` — the directive belongs on each implementation module (a `"use server"` file may only export async functions defined in it). Relative imports in chains reachable from `node --test` need explicit `.ts` extensions (`allowImportingTsExtensions` is on). Path alias: `@/*` → `src/*`.

## Tooling notes

- Supabase agent skills are synced into `.claude/skills` and `.agents/skills` on postinstall (`prisma skills sync`; `skills-lock.json` is the tracked lockfile, the skill dirs are gitignored).
- Weekly DB backup runs in **GitHub Actions** (`.github/workflows/backup.yml`), not Vercel; `/api/backup/report` is guarded by `BACKUP_REPORT_SECRET`, and `/admin/status` shows site health.
- Use Context7 MCP for current library docs (Next.js, React, Prisma, Tailwind, etc.) rather than relying on training data.