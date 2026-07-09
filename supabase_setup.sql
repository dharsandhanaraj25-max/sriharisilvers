-- ============================================================
-- SRIHARI SILVERS — Full Schema + Seed
-- Paste this entire script into Supabase SQL Editor and Run
-- ============================================================

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SALES',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Srihari Silvers',
    "address" TEXT NOT NULL DEFAULT 'Ammapet Main Road',
    "city" TEXT NOT NULL DEFAULT 'Salem',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" TEXT NOT NULL DEFAULT '636001',
    "phone" TEXT NOT NULL DEFAULT '9952797597',
    "email" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "logo" TEXT,
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankAcc" TEXT NOT NULL DEFAULT '',
    "bankIfsc" TEXT NOT NULL DEFAULT '',
    "upiId" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SilverRate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rate999" DOUBLE PRECISION NOT NULL,
    "rate925" DOUBLE PRECISION NOT NULL,
    "rate916" DOUBLE PRECISION NOT NULL,
    "rate875" DOUBLE PRECISION NOT NULL,
    "rate800" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SilverRate_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hsnCode" TEXT NOT NULL DEFAULT '71131100',
    "purity" TEXT NOT NULL DEFAULT '999',
    "grossWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stoneWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "makingChargeType" TEXT NOT NULL DEFAULT 'PER_GRAM',
    "makingChargeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "faultyStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "gstin" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "creditBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPurchases" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "birthday" TIMESTAMP(3),
    "anniversary" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "gstin" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "silverRate" DOUBLE PRECISION NOT NULL,
    "silverPurity" TEXT NOT NULL DEFAULT '999',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "makingCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oldSilverDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oldSilverWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oldSilverRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oldSilverPurity" TEXT NOT NULL DEFAULT '999',
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "cashAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "upiAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chequeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL DEFAULT '71131100',
    "grossWeight" DOUBLE PRECISION NOT NULL,
    "stoneWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "purity" TEXT NOT NULL DEFAULT '999',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "silverRate" DOUBLE PRECISION NOT NULL,
    "makingChargeType" TEXT NOT NULL DEFAULT 'PER_GRAM',
    "makingChargeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastageWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "silverValue" DOUBLE PRECISION NOT NULL,
    "makingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemTotal" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "purchaseNumber" TEXT NOT NULL,
    "supplierId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "silverRate" DOUBLE PRECISION NOT NULL,
    "silverPurity" TEXT NOT NULL DEFAULT '999',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT,
    "itemName" TEXT NOT NULL,
    "grossWeight" DOUBLE PRECISION NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "purity" TEXT NOT NULL DEFAULT '999',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "silverRate" DOUBLE PRECISION NOT NULL,
    "itemTotal" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OldSilverPurchase" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "silverRate" DOUBLE PRECISION NOT NULL,
    "purity" TEXT NOT NULL DEFAULT '999',
    "grossWeight" DOUBLE PRECISION NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OldSilverPurchase_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaleReturn" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "refundMode" TEXT NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SaleReturn_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaleReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "saleItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "restocked" BOOLEAN NOT NULL DEFAULT true,
    "faulty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaleReturnItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX "Sale_billNumber_key" ON "Sale"("billNumber");
CREATE UNIQUE INDEX "Purchase_purchaseNumber_key" ON "Purchase"("purchaseNumber");
CREATE UNIQUE INDEX "OldSilverPurchase_billNumber_key" ON "OldSilverPurchase"("billNumber");
CREATE UNIQUE INDEX "SaleReturn_returnNumber_key" ON "SaleReturn"("returnNumber");

-- Foreign Keys
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OldSilverPurchase" ADD CONSTRAINT "OldSilverPurchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturn" ADD CONSTRAINT "SaleReturn_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturn" ADD CONSTRAINT "SaleReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem" ADD CONSTRAINT "SaleReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SaleReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem" ADD CONSTRAINT "SaleReturnItem_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin@123)
INSERT INTO "User" ("id","name","email","password","role","phone","isActive","createdAt","updatedAt")
VALUES ('usr_admin_001','Admin','admin@sriharisilvers.com','$2b$10$ggOxHFjPG7sXrW/micT7SubDzWt6nhRown4bPYHlNkyrya8AZZApO','ADMIN','9952797597',true,NOW(),NOW());

-- Sales user (password: sales@123)
INSERT INTO "User" ("id","name","email","password","role","phone","isActive","createdAt","updatedAt")
VALUES ('usr_sales_001','Sales Staff','sales@sriharisilvers.com','$2b$10$kDRGUedtPp7LdcahINCHJOEtvv5WavcbB2fQAYA94O/NeC/AEoDAC','SALES','9952797598',true,NOW(),NOW());

-- Shop
INSERT INTO "Shop" ("id","name","address","city","state","pincode","phone","email","gstin","upiId","bankName","bankAcc","bankIfsc")
VALUES ('shop_001','Srihari Silvers','Ammapet Main Road','Salem','Tamil Nadu','636001','9952797597','sriharisilvers@gmail.com','SHS01007','9952797597@upi','','','');

-- Today silver rate
INSERT INTO "SilverRate" ("id","rate999","rate925","rate916","rate875","rate800","createdAt")
VALUES ('rate_001',92.50,85.56,84.73,80.94,74.00,NOW());

-- Categories
INSERT INTO "Category" ("id","name","sortOrder","isActive","createdAt") VALUES
('cat_01','Chains',1,true,NOW()),
('cat_02','Bangles',2,true,NOW()),
('cat_03','Rings',3,true,NOW()),
('cat_04','Earrings',4,true,NOW()),
('cat_05','Anklets',5,true,NOW()),
('cat_06','Necklaces',6,true,NOW()),
('cat_07','Pendants',7,true,NOW()),
('cat_08','Bracelets',8,true,NOW()),
('cat_09','Nose Pins',9,true,NOW()),
('cat_10','Coins & Bars',10,true,NOW()),
('cat_11','God Idols',11,true,NOW()),
('cat_12','Gifts & Articles',12,true,NOW());
