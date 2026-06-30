import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const lowStock = searchParams.get("lowStock") === "true";

  const where: Record<string, unknown> = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { barcode: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (lowStock) where.currentStock = { lte: prisma.product.fields.minStock };

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      categoryId: body.categoryId,
      name: body.name,
      description: body.description || null,
      hsnCode: body.hsnCode || "71131100",
      purity: body.purity || "999",
      grossWeight: parseFloat(body.grossWeight) || 0,
      netWeight: parseFloat(body.netWeight) || 0,
      stoneWeight: parseFloat(body.stoneWeight) || 0,
      makingChargeType: body.makingChargeType || "PER_GRAM",
      makingChargeValue: parseFloat(body.makingChargeValue) || 0,
      wastagePercent: parseFloat(body.wastagePercent) || 0,
      barcode: body.barcode || null,
      currentStock: parseFloat(body.currentStock) || 0,
      minStock: parseFloat(body.minStock) || 1,
    },
    include: { category: { select: { name: true } } },
  });
  return NextResponse.json(product, { status: 201 });
}
