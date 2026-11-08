import { NextResponse } from "next/server";

import { getEventGroups } from "@/lib/content/events";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const groups = await getEventGroups();
  return NextResponse.json(groups, { headers: CACHE });
}
