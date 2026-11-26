import { NextResponse } from "next/server";

import {
  getHomepageSections,
  getHomepageStats,
  getInstagramPosts,
  getWhatsNewCards,
} from "@/lib/content/homepage";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const [sections, stats, highlights, instagram] = await Promise.all([
    getHomepageSections(),
    getHomepageStats(),
    getWhatsNewCards(),
    getInstagramPosts(),
  ]);
  return NextResponse.json({ sections, stats, highlights, instagram }, { headers: CONTENT_CACHE });
}
