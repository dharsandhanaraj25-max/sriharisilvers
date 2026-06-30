// CommonJS seed script compatible with Node 21
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Srihari Silvers database...");

  // Admin user
  const adminPwd = await bcrypt.hash("admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sriharisilvers.com" },
    update: {},
    create: { name: "Admin", email: "admin@sriharisilvers.com", password: adminPwd, role: "ADMIN", phone: "9952797597" },
  });

  // Sales user
  const salesPwd = await bcrypt.hash("sales@123", 10);
  await prisma.user.upsert({
    where: { email: "sales@sriharisilvers.com" },
    update: {},
    create: { name: "Sales Staff", email: "sales@sriharisilvers.com", password: salesPwd, role: "SALES", phone: "9952797598" },
  });

  // Shop
  const shopCount = await prisma.shop.count();
  if (shopCount === 0) {
    await prisma.shop.create({
      data: {
        name: "Srihari Silvers",
        address: "Ammapet Main Road",
        city: "Salem",
        state: "Tamil Nadu",
        pincode: "636001",
        phone: "9952797597",
        email: "sriharisilvers@gmail.com",
        upiId: "9952797597@upi",
      },
    });
  }

  // Today's silver rate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingRate = await prisma.silverRate.findFirst({ where: { date: { gte: today } } });
  if (!existingRate) {
    await prisma.silverRate.create({
      data: { rate999: 92.50, rate925: 85.56, rate916: 84.73, rate875: 80.94, rate800: 74.00 },
    });
  }

  // Categories
  const categories = [
    "Chains", "Bangles", "Rings", "Earrings", "Anklets",
    "Necklaces", "Pendants", "Bracelets", "Nose Pins",
    "Coins & Bars", "God Idols", "Gifts & Articles"
  ];
  for (let i = 0; i < categories.length; i++) {
    await prisma.category.upsert({
      where: { name: categories[i] },
      update: {},
      create: { name: categories[i], sortOrder: i + 1 },
    });
  }

  // Sample products
  const chain = await prisma.category.findUnique({ where: { name: "Chains" } });
  const bangle = await prisma.category.findUnique({ where: { name: "Bangles" } });
  if (chain) {
    const c = await prisma.product.count({ where: { categoryId: chain.id } });
    if (c === 0) {
      await prisma.product.create({
        data: {
          categoryId: chain.id,
          name: "Silver Chain 18 inch",
          purity: "925",
          grossWeight: 5.200,
          netWeight: 5.200,
          makingChargeType: "PER_GRAM",
          makingChargeValue: 15,
          wastagePercent: 2,
          currentStock: 10,
          minStock: 2,
        },
      });
    }
  }
  if (bangle) {
    const b = await prisma.product.count({ where: { categoryId: bangle.id } });
    if (b === 0) {
      await prisma.product.create({
        data: {
          categoryId: bangle.id,
          name: "Silver Bangle Pair",
          purity: "999",
          grossWeight: 20.500,
          netWeight: 20.500,
          makingChargeType: "PER_GRAM",
          makingChargeValue: 20,
          wastagePercent: 3,
          currentStock: 5,
          minStock: 1,
        },
      });
    }
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("━".repeat(50));
  console.log("🔑 Login Credentials:");
  console.log("   Admin:  admin@sriharisilvers.com  /  admin@123");
  console.log("   Sales:  sales@sriharisilvers.com  /  sales@123");
  console.log("━".repeat(50));
}

main().catch(console.error).finally(() => prisma.$disconnect());
