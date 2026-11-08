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

  return (
    <div className="mx-auto max-w-3xl">
      <StatusBanners saved={params.saved} />

      <div className="mt-6">
        <GiftCardForm
          giftCard={{
            title: giftCard?.title ?? "",
            bodyHtml: giftCard?.bodyHtml ?? "",
            imageUrl: giftCard?.imageUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
