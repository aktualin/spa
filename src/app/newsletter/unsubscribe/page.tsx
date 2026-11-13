import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { PublicPageHeader } from "@/components/public/page-parts";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Berhenti Berlangganan Newsletter — KAMA Spa" };
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status === "ok";

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Newsletter"
          title={ok ? "Anda berhasil berhenti berlangganan" : "Tautan tidak valid"}
          description={
            ok
              ? "Anda tidak akan menerima email newsletter KAMA Spa lagi. Anda bisa berlangganan kembali kapan saja lewat footer situs."
              : "Tautan berhenti berlangganan ini sudah tidak berlaku atau tidak ditemukan."
          }
        />
      </main>
      <Footer />
    </>
  );
}
