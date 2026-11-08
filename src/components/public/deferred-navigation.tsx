/**
 * `Navigation` untuk rute dinamis.
 *
 * `Navigation` membaca `usePathname()` untuk menandai menu yang aktif. Di
 * rute dinamis tanpa `generateStaticParams`, pathname baru diketahui saat
 * request, sehingga Next 16 (`cacheComponents`) menolak mem-prerender shell
 * halaman — `CLIENT_HOOK_DYNAMIC`.
 *
 * Membungkusnya dalam `Suspense` membuat sisa halaman tetap ter-prerender dan
 * navigasinya menyusul saat pathname tersedia. Rute yang isinya bisa kosong
 * (event, promo) memakai ini alih-alih `generateStaticParams`, yang akan
 * menggagalkan build begitu daftarnya kosong.
 */
import { Suspense } from "react";

import { Navigation } from "@/components/navigation";

/** Placeholder setinggi header supaya konten tidak melompat saat navigasi masuk. */
function NavigationFallback() {
  return <div aria-hidden className="h-[72px] w-full bg-cream" />;
}

export function DeferredNavigation() {
  return (
    <Suspense fallback={<NavigationFallback />}>
      <Navigation />
    </Suspense>
  );
}
