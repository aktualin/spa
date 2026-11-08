import { NextResponse } from "next/server";

import {
  getHomepageReviews,
  getHomepageSections,
  getHomepageStats,
  getInstagramPosts,
  getWhatsNewCards,
} from "@/lib/content/homepage";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const [sections, stats, reviews, highlights, instagram] = await Promise.all([
    getHomepageSections(),
    getHomepageStats(),
    getHomepageReviews(),
    getWhatsNewCards(),
    getInstagramPosts(),
  ]);
  return NextResponse.json({ sections, stats, reviews, highlights, instagram }, { headers: CACHE });
}
