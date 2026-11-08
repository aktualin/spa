import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/content/site";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, { headers: CACHE });
}
