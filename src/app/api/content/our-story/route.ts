import { NextResponse } from "next/server";

import { getOurStory } from "@/lib/content/our-story";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const story = await getOurStory();
  return NextResponse.json(story, { headers: CONTENT_CACHE });
}
