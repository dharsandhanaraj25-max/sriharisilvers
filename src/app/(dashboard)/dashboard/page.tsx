import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { getCachedLatestRate } from "@/lib/cache";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role: string })?.role === "ADMIN";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todaySales, monthSales, totalCustomers, recentSales, latestRate, lowStock] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { saleDate: { gte: today, lte: todayEnd }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { saleDate: { gte: monthStart, lte: todayEnd }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.sale.findMany({
        where: { status: "COMPLETED" },
        include: { customer: { select: { name: true } } },
        orderBy: { saleDate: "desc" },
        take: 8,
      }),
      getCachedLatestRate(),
      isAdmin
        ? prisma.product.findMany({
            where: { isActive: true, currentStock: { lte: 1 } },
            include: { category: { select: { name: true } } },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

  const stats = [
    {
      label: "Today's Sales",
      value: <CountUp value={todaySales._sum.total || 0} format="currency" />,
      sub: `${todaySales._count} bills`,
      color: "from-emerald-500 to-teal-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Month Sales",
      value: <CountUp value={monthSales._sum.total || 0} format="currency" />,
      sub: `${monthSales._count} bills this month`,
      color: "from-blue-500 to-indigo-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Silver Rate (999)",
      value: latestRate ? <CountUp value={latestRate.rate999} format="decimal" prefix="₹" suffix="/g" /> : "Not Set",
      sub: "Today's rate",
      color: "from-amber-500 to-yellow-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Total Customers",
      value: <CountUp value={totalCustomers} />,
      sub: "Active customers",
      color: "from-purple-500 to-pink-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Silver Rate Banner */}
      {latestRate && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-gradient rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white shadow-md animate-fade-in-up animation-delay-100">
          <div>
            <p className="text-amber-100 text-sm font-medium">Today&apos;s Silver Rate</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-1">
              <span className="text-lg font-bold">999: ₹{latestRate.rate999}/g</span>
              <span className="text-base">925: ₹{latestRate.rate925}/g</span>
              <span className="text-base">916: ₹{latestRate.rate916}/g</span>
            </div>
          </div>
          {isAdmin && (
            <Link href="/rates" className="self-start sm:self-auto bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Update Rate
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 card-lift animate-fade-in-up animation-delay-${(i + 1) * 100}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 animate-fade-in-up animation-delay-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Sales</h2>
            <Link href="/billing" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Bill No.</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Amount</th>
                  <th className="text-center text-xs font-medium text-slate-500 px-5 py-3">Mode</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">No sales yet today</td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/billing/${sale.id}`} className="text-sm font-medium text-amber-600 hover:text-amber-700">
                          {sale.billNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-700">{sale.customer?.name || "Walk-in"}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">
                        {new Date(sale.saleDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-800 text-right">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {sale.paymentMode}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + Low Stock */}
        <div className="space-y-4 animate-fade-in-up animation-delay-400">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/billing/new" className="flex flex-col items-center gap-2 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors text-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">New Bill</span>
              </Link>
              <Link href="/customers" className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-xs font-medium">Add Customer</span>
              </Link>
              {isAdmin && (
                <>
                  <Link href="/rates" className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors text-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">Update Rate</span>
                  </Link>
                  <Link href="/reports" className="flex flex-col items-center gap-2 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors text-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium">Reports</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Low Stock Alert (Admin only) */}
          {isAdmin && lowStock.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Low Stock Alert
              </h2>
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.category.name}</p>
                    </div>
                    <span className="text-red-600 font-semibold">{p.currentStock} left</span>
                  </div>
                ))}
              </div>
              <Link href="/inventory" className="mt-3 block text-center text-xs text-amber-600 hover:text-amber-700 font-medium">
                Manage Inventory →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
