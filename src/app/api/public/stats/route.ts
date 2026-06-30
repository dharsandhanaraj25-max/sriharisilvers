import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [latestRate, billsToday, totalCustomers, totalBills] = await Promise.all([
    prisma.silverRate.findFirst({ orderBy: { date: "desc" } }),
    prisma.sale.count({ where: { createdAt: { gte: today }, status: { not: "VOID" } } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.sale.count({ where: { status: { not: "VOID" } } }),
  ]);

  return NextResponse.json({
    rate999: latestRate?.rate999 ?? null,
    rate925: latestRate?.rate925 ?? null,
    billsToday,
    totalCustomers,
    totalBills,
  });
}
