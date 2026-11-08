import { NextResponse } from "next/server";

import { getCatalog, getPackages } from "@/lib/content/catalog";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const [categories, packages] = await Promise.all([getCatalog(), getPackages()]);
  return NextResponse.json({ categories, packages }, { headers: CACHE });
}
