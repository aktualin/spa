import { NextResponse } from "next/server";

import { getActivePromos } from "@/lib/content/promos";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const promos = await getActivePromos();
  return NextResponse.json({ promos }, { headers: CONTENT_CACHE });
}
