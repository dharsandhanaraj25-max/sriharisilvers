import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BillingForm } from "@/components/billing/BillingForm";

export default async function NewBillPage() {
  const session = await getServerSession(authOptions);

  const [latestRate, categories] = await Promise.all([
    prisma.silverRate.findFirst({ orderBy: { date: "desc" } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">New Bill</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new sales invoice</p>
      </div>
      <BillingForm
        latestRate={latestRate}
        categories={categories}
        createdById={(session?.user as { id: string }).id}
      />
    </div>
  );
}
