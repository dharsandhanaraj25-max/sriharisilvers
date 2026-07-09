import { NextResponse } from "next/server";
import { getCachedPublicStats } from "@/lib/cache";

export async function GET() {
  const stats = await getCachedPublicStats();
  return NextResponse.json(stats);
}
