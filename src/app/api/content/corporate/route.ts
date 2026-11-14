import { NextResponse } from "next/server";

import { getCorporatePageData } from "@/lib/content/corporate";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const data = await getCorporatePageData();
  return NextResponse.json(data, { headers: CONTENT_CACHE });
}
