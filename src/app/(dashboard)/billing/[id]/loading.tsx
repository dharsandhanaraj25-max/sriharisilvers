import { Skeleton } from "@/components/ui/Skeleton";

// Mirrors the bill detail page: toolbar + receipt card.
export default function BillDetailLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto p-6 space-y-5">
        {/* Receipt header */}
        <div className="flex flex-col items-center gap-2 border-b-4 border-slate-100 pb-4">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Bill meta */}
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Items table */}
        <Skeleton className="h-40 w-full rounded" />
        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
