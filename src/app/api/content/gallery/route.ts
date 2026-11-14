import { NextResponse } from "next/server";

import { getGalleryAlbums } from "@/lib/content/gallery";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const albums = await getGalleryAlbums();
  return NextResponse.json({ albums }, { headers: CONTENT_CACHE });
}
