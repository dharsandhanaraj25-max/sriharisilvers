import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { role: string } | undefined;
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id },
    include: {
      sale: {
        include: {
          customer: true,
          items: true,
        },
      },
      items: { include: { saleItem: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (!saleReturn) return NextResponse.json({ error: "Return not found" }, { status: 404 });
  return NextResponse.json(saleReturn);
}
