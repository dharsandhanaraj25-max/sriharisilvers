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
  const dateParam = searchParams.get("date");

  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const [sales, expenses, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        status: { not: "VOID" },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: { select: { itemName: true, netWeight: true, quantity: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.purchase.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        status: { not: "VOID" },
      },
      include: { supplier: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Payment mode breakdown
  const paymentBreakdown: Record<string, number> = {};
  for (const s of sales) {
    const mode = s.paymentMode;
    paymentBreakdown[mode] = (paymentBreakdown[mode] || 0) + s.total;
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalGSTCollected = sales.reduce((sum, s) => sum + s.gstAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchased = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalWeightSold = sales.flatMap((s) => s.items).reduce((sum, i) => sum + i.netWeight * i.quantity, 0);
  const netCash = (paymentBreakdown["CASH"] || 0) - totalExpenses;

  return NextResponse.json({
    date: dayStart.toISOString(),
    sales,
    expenses,
    purchases,
    summary: {
      totalBills: sales.length,
      totalRevenue,
      totalGSTCollected,
      totalExpenses,
      totalPurchased,
      totalWeightSold,
      netCash,
      paymentBreakdown,
    },
  });
}
