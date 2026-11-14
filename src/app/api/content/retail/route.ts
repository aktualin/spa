import { NextResponse } from "next/server";

import { getRetailProducts } from "@/lib/content/retail";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const products = await getRetailProducts();
  return NextResponse.json({ products }, { headers: CONTENT_CACHE });
}
