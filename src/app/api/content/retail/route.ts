import { NextResponse } from "next/server";

import { getRetailProducts } from "@/lib/content/retail";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } as const;

export async function GET() {
  const products = await getRetailProducts();
  return NextResponse.json({ products }, { headers: CACHE });
}
