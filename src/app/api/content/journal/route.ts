import { NextResponse } from "next/server";

import { getJournalCategories, getJournalPosts, getJournalTags } from "@/lib/content/journal";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const [all, categories, tags] = await Promise.all([
    getJournalPosts(),
    getJournalCategories(),
    getJournalTags(),
  ]);
  // Isi artikel hanya dikirim di endpoint detail supaya payload list tetap kecil.
  const posts = all.map(({ bodyHtml: _bodyHtml, ...rest }) => rest);
  return NextResponse.json({ posts, categories, tags }, { headers: CONTENT_CACHE });
}
