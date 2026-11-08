import { NextResponse } from "next/server";

import { getMembershipProgram, getMembershipTiers } from "@/lib/content/membership";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const [program, tiers] = await Promise.all([getMembershipProgram(), getMembershipTiers()]);
  return NextResponse.json({ program, tiers }, { headers: CACHE });
}
