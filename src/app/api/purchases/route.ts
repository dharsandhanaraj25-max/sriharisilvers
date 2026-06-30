import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.purchaseDate = {};
    if (from) (where.purchaseDate as Record<string, unknown>).gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      (where.purchaseDate as Record<string, unknown>).lte = toDate;
    }
  }

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        items: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { purchaseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchase.count({ where }),
  ]);

  return NextResponse.json({ purchases, total, page, limit });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { id: string; role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const count = await prisma.purchase.count();
  const purchaseNumber = `PUR${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(count + 1).padStart(4, "0")}`;

  const purchase = await prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId: body.supplierId || null,
        purchaseDate: new Date(),
        silverRate: body.silverRate,
        silverPurity: body.silverPurity || "999",
        subtotal: body.subtotal,
        gstPercent: body.gstPercent || 0,
        gstAmount: body.gstAmount || 0,
        total: body.total,
        paymentMode: body.paymentMode || "CASH",
        amountPaid: body.amountPaid || body.total,
        notes: body.notes || null,
        status: "COMPLETED",
        createdById: user.id,
        items: {
          create: body.items.map((item: Record<string, unknown>) => ({
            productId: (item.productId as string) || null,
            itemName: item.itemName as string,
            grossWeight: item.grossWeight as number,
            netWeight: item.netWeight as number,
            purity: (item.purity as string) || "999",
            quantity: (item.quantity as number) || 1,
            silverRate: item.silverRate as number,
            itemTotal: item.itemTotal as number,
          })),
        },
      },
      include: { items: true },
    });

    // Update product stock
    for (const item of body.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId as string },
          data: { currentStock: { increment: (item.quantity as number) || 1 } },
        });
      }
    }

    return newPurchase;
  });

  return NextResponse.json(purchase, { status: 201 });
}
