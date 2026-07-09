import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { SHOP_GSTIN } from "./utils";

/**
 * Cached reads for semi-static data (silver rate, shop settings, login
 * stats). Each entry has a TTL fallback plus a tag, so the API route
 * that changes the data can invalidate it instantly via revalidateTag.
 *
 * Money paths (bill creation, sales, stock) must NOT use these — they
 * always read live from the database.
 */

export const CACHE_TAGS = {
  rates: "rates",
  shop: "shop",
  publicStats: "public-stats",
} as const;

/** Latest silver rate. Scalar fields only so the cached JSON round-trips safely. */
export const getCachedLatestRate = unstable_cache(
  async () => {
    const r = await prisma.silverRate.findFirst({ orderBy: { date: "desc" } });
    if (!r) return null;
    return {
      rate999: r.rate999,
      rate925: r.rate925,
      rate916: r.rate916,
      rate875: r.rate875,
      rate800: r.rate800,
    };
  },
  ["latest-silver-rate"],
  { tags: [CACHE_TAGS.rates], revalidate: 300 }
);

/** Shop settings (name, address, GSTIN, bank details). */
export const getCachedShop = unstable_cache(
  async () => {
    const shop = await prisma.shop.findFirst();
    if (shop && !shop.gstin) shop.gstin = SHOP_GSTIN;
    return shop;
  },
  ["shop-settings"],
  { tags: [CACHE_TAGS.shop], revalidate: 3600 }
);

/** Public stats shown on the login page. */
export const getCachedPublicStats = unstable_cache(
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [latestRate, billsToday, totalCustomers, totalBills] = await Promise.all([
      prisma.silverRate.findFirst({ orderBy: { date: "desc" } }),
      prisma.sale.count({ where: { createdAt: { gte: today }, status: { not: "VOID" } } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.sale.count({ where: { status: { not: "VOID" } } }),
    ]);

    return {
      rate999: latestRate?.rate999 ?? null,
      rate925: latestRate?.rate925 ?? null,
      billsToday,
      totalCustomers,
      totalBills,
    };
  },
  ["public-stats"],
  { tags: [CACHE_TAGS.publicStats, CACHE_TAGS.rates], revalidate: 60 }
);
