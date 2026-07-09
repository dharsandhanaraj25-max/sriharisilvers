import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCachedShop, CACHE_TAGS } from "@/lib/cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cached (tag: "shop"); GSTIN fallback happens inside the cached getter
  const shop = await getCachedShop();
  return NextResponse.json(shop);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const shop = await prisma.shop.findFirst();

  if (shop) {
    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        phone: body.phone,
        email: body.email || "",
        gstin: body.gstin || "",
        bankName: body.bankName || "",
        bankAcc: body.bankAcc || "",
        bankIfsc: body.bankIfsc || "",
        upiId: body.upiId || "",
      },
    });
    revalidateTag(CACHE_TAGS.shop, { expire: 0 });
    return NextResponse.json(updated);
  } else {
    const created = await prisma.shop.create({ data: body });
    revalidateTag(CACHE_TAGS.shop, { expire: 0 });
    return NextResponse.json(created, { status: 201 });
  }
}
