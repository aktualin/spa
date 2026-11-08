import { NextResponse } from "next/server";

import { getJournalCategories, getJournalPosts, getJournalTags } from "@/lib/content/journal";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const [all, categories, tags] = await Promise.all([
    getJournalPosts(),
    getJournalCategories(),
    getJournalTags(),
  ]);
  // Isi artikel hanya dikirim di endpoint detail supaya payload list tetap kecil.
  const posts = all.map(({ bodyHtml: _bodyHtml, ...rest }) => rest);
  return NextResponse.json({ posts, categories, tags }, { headers: CACHE });
}
