import { ProjectHeaderSkeleton, SectionSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <ProjectHeaderSkeleton />
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <SectionSkeleton />
      </div>
    </>
  );
}
