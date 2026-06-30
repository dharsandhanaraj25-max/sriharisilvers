import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
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
      currentStock: parseFloat(body.currentStock),
      minStock: parseFloat(body.minStock) || 1,
    },
    include: { category: { select: { name: true } } },
  });
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
