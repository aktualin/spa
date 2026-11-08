import { staticGiftCard } from "@/lib/content/gift-card";

import { getGiftCard } from "../actions/gift-card";
import { StatusBanners } from "../promos/_kit/list-ui";
import { GiftCardForm } from "./gift-card-form";

export const instant = false;

export default async function AdminGiftCardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [giftCard, params] = await Promise.all([getGiftCard(), searchParams]);
  // Belum pernah disimpan: form diisi teks yang saat ini tampil di situs.
  const fallback = staticGiftCard();

  return (
    <div className="mx-auto max-w-3xl">
      <StatusBanners saved={params.saved} />

      <div className="mt-6">
        <GiftCardForm
          giftCard={{
            title: giftCard?.title ?? fallback.title,
            subtitle: giftCard?.subtitle ?? "",
            bodyHtml: giftCard?.bodyHtml ?? fallback.bodyHtml,
            imageUrl: giftCard?.imageUrl ?? (giftCard ? "" : fallback.imageUrl ?? ""),
            termsHtml: giftCard?.termsHtml ?? "",
            whatsappMessage: giftCard?.whatsappMessage ?? "",
          }}
          isNew={!giftCard}
        />
      </div>
    </div>
  );
}
