import { NextResponse } from "next/server";

import { getCorporatePageData } from "@/lib/content/corporate";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const data = await getCorporatePageData();
  return NextResponse.json(data, { headers: CACHE });
}
