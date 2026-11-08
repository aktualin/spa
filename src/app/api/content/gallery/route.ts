import { NextResponse } from "next/server";

import { getGalleryAlbums } from "@/lib/content/gallery";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const albums = await getGalleryAlbums();
  return NextResponse.json({ albums }, { headers: CACHE });
}
