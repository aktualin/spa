import type { NextConfig } from "next";

/**
 * Header keamanan untuk semua halaman. Content-Security-Policy sengaja belum
 * dipasang: situs memuat Leaflet dari unpkg, GA4, dan embed Google Maps — CSP
 * yang salah merusak tampilan, jadi perlu diuji di browser lebih dulu.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HTTPS dipaksa Vercel; HSTS memastikan browser tidak pernah mencoba HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/**
 * Base URL aset statis di bucket S3 (lihat src/lib/asset-url.ts). Diturunkan
 * dari konfigurasi storage yang sudah ada supaya tidak perlu env tambahan.
 */
const assetBaseUrl =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL && process.env.SUPABASE_S3_BUCKET
    ? `${process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL.replace(/\/$/, "")}/${process.env.SUPABASE_S3_BUCKET}`
    : "");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_ASSET_BASE_URL: assetBaseUrl },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Halaman admin tidak boleh disimpan cache bersama atau diindeks.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
