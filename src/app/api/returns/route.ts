import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { role: string } | undefined;
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { returnNumber: { contains: search } },
          { sale: { billNumber: { contains: search } } },
          { reason: { contains: search } },
        ],
      }
    : {};

  const [returns, total] = await Promise.all([
    prisma.saleReturn.findMany({
      where,
      include: {
        sale: { select: { billNumber: true, customer: { select: { name: true, phone: true } } } },
        createdBy: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.saleReturn.count({ where }),
  ]);

  return NextResponse.json({ returns, total, page, pages: Math.ceil(total / limit) });
}
