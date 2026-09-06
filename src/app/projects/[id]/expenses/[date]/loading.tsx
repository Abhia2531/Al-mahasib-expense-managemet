import { ListSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading day">
      <Skeleton className="h-6 w-40 rounded-sm" />
      <ListSkeleton rows={4} />
    </div>
  );
}
