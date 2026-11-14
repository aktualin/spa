import { NextResponse } from "next/server";

import {
  getHomepageReviews,
  getHomepageSections,
  getHomepageStats,
  getInstagramPosts,
  getWhatsNewCards,
} from "@/lib/content/homepage";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const [sections, stats, reviews, highlights, instagram] = await Promise.all([
    getHomepageSections(),
    getHomepageStats(),
    getHomepageReviews(),
    getWhatsNewCards(),
    getInstagramPosts(),
  ]);
  return NextResponse.json({ sections, stats, reviews, highlights, instagram }, { headers: CONTENT_CACHE });
}
