import { NextResponse } from "next/server";

import { getCatalog, getPackages } from "@/lib/content/catalog";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const [categories, packages] = await Promise.all([getCatalog(), getPackages()]);
  return NextResponse.json({ categories, packages }, { headers: CONTENT_CACHE });
}
