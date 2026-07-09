import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sriharisilvers.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@sriharisilvers.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "9952797597",
    },
  });

  // Create sales user
  const salesPassword = await bcrypt.hash("sales@123", 10);
  await prisma.user.upsert({
    where: { email: "sales@sriharisilvers.com" },
    update: {},
    create: {
      name: "Sales Staff",
      email: "sales@sriharisilvers.com",
      password: salesPassword,
      role: "SALES",
      phone: "9952797598",
    },
  });

  // Create shop settings
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
        gstin: "SHS01007",
        upiId: "9952797597@upi",
      },
    });
  }

  // Seed today's silver rate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingRate = await prisma.silverRate.findFirst({
    where: { date: { gte: today } },
  });
  if (!existingRate) {
    await prisma.silverRate.create({
      data: {
        rate999: 92.5,
        rate925: 85.56,
        rate916: 84.73,
        rate875: 80.94,
        rate800: 74.0,
      },
    });
  }

  // Seed categories
  const categories = [
    { name: "Chains", sortOrder: 1 },
    { name: "Bangles", sortOrder: 2 },
    { name: "Rings", sortOrder: 3 },
    { name: "Earrings", sortOrder: 4 },
    { name: "Anklets", sortOrder: 5 },
    { name: "Necklaces", sortOrder: 6 },
    { name: "Pendants", sortOrder: 7 },
    { name: "Bracelets", sortOrder: 8 },
    { name: "Nose Pins", sortOrder: 9 },
    { name: "Coins & Bars", sortOrder: 10 },
    { name: "God Idols", sortOrder: 11 },
    { name: "Gifts & Articles", sortOrder: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Seeding complete!");
  console.log("Admin login: admin@sriharisilvers.com / admin@123");
  console.log("Sales login: sales@sriharisilvers.com / sales@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
