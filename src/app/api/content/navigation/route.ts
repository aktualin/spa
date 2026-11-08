import { NextResponse } from "next/server";

import { getNavigationData } from "@/lib/content/navigation";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const navigation = await getNavigationData();
  return NextResponse.json(navigation, { headers: CACHE });
}
