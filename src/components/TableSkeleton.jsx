import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="rounded-xl border p-5">
      <Skeleton className="mb-5 h-6 w-36" />

      <div className="overflow-hidden rounded-lg border">
        {/* Header */}
        <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr_80px] border-b px-3 py-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr_1.2fr_1fr_80px] items-center border-b px-3 py-5 last:border-b-0"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="ml-auto h-5 w-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
