import { NextResponse } from "next/server";

import { getOurStory } from "@/lib/content/our-story";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const story = await getOurStory();
  return NextResponse.json(story, { headers: CACHE });
}
