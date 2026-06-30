import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { role: string; id: string } | undefined;
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { reason, refundMode, notes, items } = body as {
      reason: string;
      refundMode: string;
      notes?: string;
      items: Array<{ saleItemId: string; quantity: number; refundAmount: number; restocked: boolean; faulty: boolean }>;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items selected for return" }, { status: 400 });
    }

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    if (sale.status === "RETURNED") {
      return NextResponse.json({ error: "Sale is already fully returned" }, { status: 400 });
    }

    const totalRefund = items.reduce((sum, i) => sum + i.refundAmount, 0);

    // Generate return number
    const returnCount = await prisma.saleReturn.count();
    const returnNumber = `RET-${String(returnCount + 1).padStart(5, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      // Create return record
      const saleReturn = await tx.saleReturn.create({
        data: {
          returnNumber,
          saleId: id,
          reason,
          refundAmount: totalRefund,
          refundMode,
          notes,
          createdById: sessionUser.id,
          items: {
            create: items.map((item) => {
              const originalItem = sale.items.find((si) => si.id === item.saleItemId);
              return {
                saleItemId: item.saleItemId,
                itemName: originalItem?.itemName || "Unknown",
                quantity: item.quantity,
                netWeight: (originalItem?.netWeight || 0) * (item.quantity / (originalItem?.quantity || 1)),
                refundAmount: item.refundAmount,
                restocked: item.restocked,
                faulty: item.faulty,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Restock inventory
      for (const item of items) {
        if (!item.restocked) continue;
        const originalItem = sale.items.find((si) => si.id === item.saleItemId);
        if (originalItem?.productId) {
          if (item.faulty) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (tx.product.update as any)({
              where: { id: originalItem.productId },
              data: { faultyStock: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: originalItem.productId },
              data: { currentStock: { increment: item.quantity } },
            });
          }
        }
      }

      // Update sale status
      const existingReturnItems = await tx.saleReturnItem.findMany({
        where: { return: { saleId: id } },
      });
      const totalReturnedItems = existingReturnItems.length;
      const allItemsReturned = totalReturnedItems >= sale.items.length;
      await tx.sale.update({
        where: { id },
        data: { status: allItemsReturned ? "RETURNED" : "PARTIALLY_RETURNED" },
      });

      // Adjust customer totals
      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalPurchases: { decrement: totalRefund },
            loyaltyPoints: { decrement: Math.floor(totalRefund / 1000) },
          },
        });
      }

      return saleReturn;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Return error:", error);
    return NextResponse.json({ error: "Failed to process return" }, { status: 500 });
  }
}
