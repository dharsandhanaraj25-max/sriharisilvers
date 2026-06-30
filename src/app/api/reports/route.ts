import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sessionUser = session.user as { role: string };
  if (sessionUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "dashboard";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);

  if (type === "dashboard") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todaySales,
      monthSales,
      totalCustomers,
      lowStockProducts,
      recentSales,
      latestRate,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { saleDate: { gte: today, lte: todayEnd }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { saleDate: { gte: fromDate, lte: toDate }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true, currentStock: { lte: 1 } },
        include: { category: { select: { name: true } } },
        take: 5,
      }),
      prisma.sale.findMany({
        where: { status: "COMPLETED" },
        include: { customer: { select: { name: true } } },
        orderBy: { saleDate: "desc" },
        take: 5,
      }),
      prisma.silverRate.findFirst({ orderBy: { date: "desc" } }),
    ]);

    return NextResponse.json({
      todaySales: { total: todaySales._sum.total || 0, count: todaySales._count },
      monthSales: { total: monthSales._sum.total || 0, count: monthSales._count },
      totalCustomers,
      lowStockProducts,
      recentSales,
      latestRate,
    });
  }

  if (type === "sales") {
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: { gte: fromDate, lte: toDate },
        status: { not: "CANCELLED" },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { saleDate: "desc" },
    });

    const summary = {
      totalBills: sales.length,
      totalAmount: sales.reduce((s, x) => s + x.total, 0),
      totalGST: sales.reduce((s, x) => s + x.gstAmount, 0),
      totalDiscount: sales.reduce((s, x) => s + x.discount, 0),
      totalWeight: sales.reduce((s, x) => s + x.items.reduce((si, i) => si + i.netWeight, 0), 0),
    };

    return NextResponse.json({ sales, summary });
  }

  if (type === "gst") {
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: { gte: fromDate, lte: toDate },
        status: "COMPLETED",
      },
      include: { customer: true, items: true },
      orderBy: { saleDate: "asc" },
    });

    const gstSummary = {
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalGST: 0,
    };

    const rows = sales.map((s) => {
      const taxable = s.total - s.gstAmount;
      const cgst = s.gstAmount / 2;
      const sgst = s.gstAmount / 2;
      gstSummary.totalTaxableValue += taxable;
      gstSummary.totalCGST += cgst;
      gstSummary.totalSGST += sgst;
      gstSummary.totalGST += s.gstAmount;
      return { ...s, taxableValue: taxable, cgst, sgst };
    });

    return NextResponse.json({ rows, summary: gstSummary });
  }

  if (type === "stock") {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json({ products });
  }

  if (type === "profit") {
    const [sales, purchases, expenses] = await Promise.all([
      prisma.sale.aggregate({
        where: { saleDate: { gte: fromDate, lte: toDate }, status: "COMPLETED" },
        _sum: { total: true, gstAmount: true },
      }),
      prisma.purchase.aggregate({
        where: { purchaseDate: { gte: fromDate, lte: toDate }, status: "COMPLETED" },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: fromDate, lte: toDate } },
        _sum: { amount: true },
      }),
    ]);

    const revenue = (sales._sum.total || 0) - (sales._sum.gstAmount || 0);
    const cost = purchases._sum.total || 0;
    const exp = expenses._sum.amount || 0;
    return NextResponse.json({
      revenue,
      cost,
      expenses: exp,
      grossProfit: revenue - cost,
      netProfit: revenue - cost - exp,
      gstCollected: sales._sum.gstAmount || 0,
    });
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
}
