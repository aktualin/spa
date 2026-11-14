import "./globals.css";
import { Analytics } from "@/components/analytics/analytics";
import { WhatsAppButton } from "@/components/whatsapp-button";

export { generateRootMetadata as generateMetadata } from "./layout-metadata";

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
        {/* Font utama dipreload agar heading (Faesa) dan body (POI Carbonic)
            tidak berkedip saat `font-display: swap` berganti. */}
        <link
          rel="preload"
          href="/fonts/FaesaBreages-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/POICarbonicTrial-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
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
        <Analytics />
      </body>
    </html>
  );
}