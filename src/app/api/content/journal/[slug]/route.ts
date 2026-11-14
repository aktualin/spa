import { NextResponse } from "next/server";

import { getJournalPost } from "@/lib/content/journal";

import { CONTENT_CACHE } from "../../cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ post }, { headers: CONTENT_CACHE });
}
