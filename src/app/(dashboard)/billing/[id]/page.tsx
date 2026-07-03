import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BillPrintView } from "@/components/billing/BillPrintView";
import { PrintButton } from "@/components/billing/PrintButton";
import { ReturnButton } from "@/components/billing/ReturnButton";
import { VoidButton } from "@/components/billing/VoidButton";
import Link from "next/link";

export default async function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      createdBy: { select: { name: true } },
    },
  });

  if (!sale) notFound();

  const sessionUser = session?.user as { role?: string } | undefined;
  const isAdmin = sessionUser?.role === "ADMIN";
  const canReturn = isAdmin && sale.status !== "RETURNED" && sale.status !== "VOID";
  const canVoid = isAdmin && sale.status !== "VOID" && sale.status !== "RETURNED";

  return (
    <div>
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/billing" className="text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Bill #{sale.billNumber}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-500">Created by {sale.createdBy.name}</p>
              {sale.status !== "COMPLETED" && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  sale.status === "RETURNED"
                    ? "bg-red-100 text-red-700"
                    : sale.status === "VOID"
                    ? "bg-gray-200 text-gray-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {sale.status === "RETURNED" ? "Returned" : sale.status === "VOID" ? "VOID" : "Partially Returned"}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {canVoid && <VoidButton saleId={sale.id} billNumber={sale.billNumber} />}
          {canReturn && (
            <ReturnButton
              saleId={sale.id}
              billNumber={sale.billNumber}
              items={sale.items.map((i) => ({
                id: i.id,
                itemName: i.itemName,
                quantity: i.quantity,
                netWeight: i.netWeight,
                purity: i.purity,
                itemTotal: i.itemTotal,
              }))}
              total={sale.total}
            />
          )}
          <PrintButton />
          <Link href="/billing/new" className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
            New Bill
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        <BillPrintView
          billNumber={sale.billNumber}
          customer={sale.customer ? { name: sale.customer.name, phone: sale.customer.phone } : null}
          items={sale.items.map((i) => ({ ...i, isFixedPrice: i.makingChargeType === "FIXED" }))}
          subtotal={sale.subtotal}
          totalMaking={sale.makingCharges}
          totalWastage={sale.wastageAmount}
          totalGST={sale.gstAmount}
          discount={sale.discount}
          oldSilverDeduction={sale.oldSilverDeduction}
          oldSilverWeight={sale.oldSilverWeight}
          oldSilverRate={sale.oldSilverRate}
          roundOff={sale.roundOff}
          total={sale.total}
          paymentMode={sale.paymentMode}
          amountPaid={sale.amountPaid}
          change={sale.change}
          notes={sale.notes || ""}
          silverRate999={sale.silverRate}
        />
      </div>
    </div>
  );
}
