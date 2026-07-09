import { Skeleton } from "@/components/ui/Skeleton";

// Generic skeleton shown while any dashboard-group page is server-rendered.
export default function DashboardGroupLoading() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Filter / toolbar card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-32 hidden sm:block" />
        <Skeleton className="h-9 w-32 hidden sm:block" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40 flex-1" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
