import { NextResponse } from "next/server";

import { getNavigationData } from "@/lib/content/navigation";

import { CONTENT_CACHE } from "../cache";

export async function GET() {
  const navigation = await getNavigationData();
  return NextResponse.json(navigation, { headers: CONTENT_CACHE });
}
