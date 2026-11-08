import { NextResponse } from "next/server";

import { getGiftCard } from "@/lib/content/gift-card";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const giftCard = await getGiftCard();
  return NextResponse.json(giftCard, { headers: CACHE });
}
