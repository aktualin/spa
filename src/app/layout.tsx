import type { Metadata } from "next";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getSeoSettings } from "@/lib/content/seo";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_TITLE,
  OG_LOCALE,
  SITE_NAME,
  TITLE_TEMPLATE,
  faviconIcons,
  indexingDisabled,
} from "@/lib/domain/seo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Metadata root. Favicon, gambar OG bawaan, dan verifikasi Google Search
 * Console dibaca dari `/admin/seo/settings` lewat fungsi `"use cache"`, jadi
 * perubahan tampil tanpa redeploy dan situs tetap bisa di-prerender.
 *
 * Canonical SENGAJA tidak diset di sini: nilai root diwarisi semua halaman
 * yang tidak mengisinya sendiri, dan canonical "/" di halaman lain menyuruh
 * Google mengabaikan halaman tersebut. Canonical diisi per halaman oleh
 * `withPageSeo`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  const ogImages = settings.defaultOgImageUrl
    ? [{ url: settings.defaultOgImageUrl }]
    : undefined;

  return {
    // Tanpa ini, URL Open Graph dan canonical dirender relatif dan ditolak
    // sebagian crawler.
    metadataBase: new URL(getSiteUrl()),
    applicationName: SITE_NAME,
    title: {
      default: DEFAULT_TITLE,
      template: TITLE_TEMPLATE,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "KAMA Spa",
      "massage Jakarta",
      "spa South Jakarta",
      "day spa",
      "corporate wellness",
      "Sukma Laya",
      "Urip Padma",
    ],
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_OG_DESCRIPTION,
      type: "website",
      locale: OG_LOCALE,
      siteName: SITE_NAME,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: { card: ogImages ? "summary_large_image" : "summary" },
    icons: faviconIcons(settings.faviconUrl),
    ...(settings.gscVerification
      ? { verification: { google: settings.gscVerification } }
      : {}),
    ...(indexingDisabled(process.env)
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      /* The inline script below sets `data-js` on <html> before React
         hydrates, so the attribute only exists on the client. React must not
         try to reconcile it. */
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        />
      </head>
      <body className="flex min-h-full flex-col bg-cream-soft font-sans text-cocoa">
        
        {/* Marks the document as script-enabled, so the scroll-reveal
            animations may hide their blocks. Without JS the content stays
            visible — the site must never depend on JavaScript to be read. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='true'",
          }}
        />
        {children}
        
        <WhatsAppButton />
      </body>
    </html>
  );
}
