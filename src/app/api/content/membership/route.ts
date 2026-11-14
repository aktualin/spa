import { NextResponse } from "next/server";

import { getMembershipProgram, getMembershipTiers } from "@/lib/content/membership";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const [program, tiers] = await Promise.all([getMembershipProgram(), getMembershipTiers()]);
  return NextResponse.json({ program, tiers }, { headers: CONTENT_CACHE });
}
