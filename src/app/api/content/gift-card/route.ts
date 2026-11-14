import { NextResponse } from "next/server";

import { getGiftCard } from "@/lib/content/gift-card";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const giftCard = await getGiftCard();
  return NextResponse.json(giftCard, { headers: CONTENT_CACHE });
}
