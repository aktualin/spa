import { NextResponse } from "next/server";

import { getEventGroups } from "@/lib/content/events";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const groups = await getEventGroups();
  return NextResponse.json(groups, { headers: CONTENT_CACHE });
}
