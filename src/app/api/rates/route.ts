import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rate = await prisma.silverRate.findFirst({
    orderBy: { date: "desc" },
  });

  const history = await prisma.silverRate.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json({ rate, history });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id: string; role: string };
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can update rates" }, { status: 403 });
  }

  const body = await request.json();
  const { rate999, rate925, rate916, rate875, rate800 } = body;

  const rate = await prisma.silverRate.create({
    data: {
      rate999: parseFloat(rate999),
      rate925: parseFloat(rate925),
      rate916: parseFloat(rate916),
      rate875: parseFloat(rate875),
      rate800: parseFloat(rate800),
    },
  });

  // New rate must show up instantly in the top bar, dashboard and login page
  revalidateTag(CACHE_TAGS.rates, { expire: 0 });
  revalidateTag(CACHE_TAGS.publicStats, { expire: 0 });

  return NextResponse.json(rate);
}
