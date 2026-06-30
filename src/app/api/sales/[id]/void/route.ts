import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { role: string; id: string } | undefined;
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

    if (sale.status === "VOID") {
      return NextResponse.json({ error: "Bill is already voided" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of sale.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });
        }
      }

      // Adjust customer totals
      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalPurchases: { decrement: sale.total },
            totalVisits: { decrement: 1 },
            loyaltyPoints: { decrement: Math.floor(sale.total / 1000) },
          },
        });
      }

      // Mark sale as VOID
      await tx.sale.update({
        where: { id },
        data: { status: "VOID" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Void error:", error);
    return NextResponse.json({ error: "Failed to void bill" }, { status: 500 });
  }
}
