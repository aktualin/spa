import { NextResponse } from "next/server";

import { getActivePromos } from "@/lib/content/promos";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const promos = await getActivePromos();
  return NextResponse.json({ promos }, { headers: CACHE });
}
