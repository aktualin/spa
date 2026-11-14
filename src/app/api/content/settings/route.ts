import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/content/site";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, { headers: CONTENT_CACHE });
}
