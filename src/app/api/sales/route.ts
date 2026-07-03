import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { billNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { phone: { contains: search } } },
    ];
  }
  if (from || to) {
    where.saleDate = {};
    if (from) (where.saleDate as Record<string, unknown>).gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      (where.saleDate as Record<string, unknown>).lte = toDate;
    }
  }
  if (status) where.status = status;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        items: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({ sales, total, page, limit });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id: string };
  const body = await request.json();

  if (!body.customerId && !body.newCustomer) {
    return NextResponse.json({ error: "Customer is required" }, { status: 400 });
  }
  if (body.newCustomer) {
    const existing = await prisma.customer.findUnique({ where: { phone: body.newCustomer.phone } });
    if (existing) {
      return NextResponse.json(
        { error: `Phone ${body.newCustomer.phone} is already registered as "${existing.name}". Please search and select them instead.` },
        { status: 409 }
      );
    }
  }

  const count = await prisma.sale.count();
  const billNumber = `SHS${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(count + 1).padStart(4, "0")}`;

  const sale = await prisma.$transaction(async (tx) => {
    let customerId = body.customerId || null;
    if (body.newCustomer) {
      const created = await tx.customer.create({
        data: { name: body.newCustomer.name, phone: body.newCustomer.phone },
      });
      customerId = created.id;
    } else if (customerId && body.customerName) {
      // Same phone = same customer record. Only the name may need updating
      // (e.g. a nickname was on file and the full name was given this time).
      const existingCustomer = await tx.customer.findUnique({ where: { id: customerId } });
      if (existingCustomer && existingCustomer.name !== body.customerName) {
        await tx.customer.update({ where: { id: customerId }, data: { name: body.customerName } });
      }
    }

    const newSale = await tx.sale.create({
      data: {
        billNumber,
        customerId,
        saleDate: new Date(),
        silverRate: body.silverRate,
        silverPurity: body.silverPurity || "999",
        subtotal: body.subtotal,
        makingCharges: body.makingCharges || 0,
        wastageAmount: body.wastageAmount || 0,
        gstPercent: body.gstPercent || 3,
        gstAmount: body.gstAmount || 0,
        discount: body.discount || 0,
        oldSilverDeduction: body.oldSilverDeduction || 0,
        oldSilverWeight: body.oldSilverWeight || 0,
        oldSilverRate: body.oldSilverRate || 0,
        oldSilverPurity: body.oldSilverPurity || "999",
        roundOff: body.roundOff || 0,
        total: body.total,
        paymentMode: body.paymentMode || "CASH",
        cashAmount: body.cashAmount || 0,
        cardAmount: body.cardAmount || 0,
        upiAmount: body.upiAmount || 0,
        chequeAmount: body.chequeAmount || 0,
        amountPaid: body.amountPaid || body.total,
        change: body.change || 0,
        notes: body.notes || null,
        status: "COMPLETED",
        createdById: user.id,
        items: {
          create: body.items.map((item: Record<string, unknown>) => ({
            productId: (item.productId as string) || null,
            itemName: item.itemName as string,
            hsnCode: (item.hsnCode as string) || "71131100",
            grossWeight: item.grossWeight as number,
            stoneWeight: (item.stoneWeight as number) || 0,
            netWeight: item.netWeight as number,
            purity: (item.purity as string) || "999",
            quantity: (item.quantity as number) || 1,
            silverRate: item.silverRate as number,
            makingChargeType: (item.makingChargeType as string) || "PER_GRAM",
            makingChargeValue: (item.makingChargeValue as number) || 0,
            wastagePercent: (item.wastagePercent as number) || 0,
            wastageWeight: (item.wastageWeight as number) || 0,
            silverValue: item.silverValue as number,
            makingAmount: (item.makingAmount as number) || 0,
            gstAmount: (item.gstAmount as number) || 0,
            itemTotal: item.itemTotal as number,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    // Update customer totals
    if (customerId) {
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalPurchases: { increment: body.total },
          totalVisits: { increment: 1 },
          loyaltyPoints: { increment: Math.floor(body.total / 100) },
        },
      });
    }

    // Update product stock
    for (const item of body.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId as string },
          data: { currentStock: { decrement: (item.quantity as number) || 1 } },
        });
      }
    }

    return newSale;
  });

  return NextResponse.json(sale, { status: 201 });
}
