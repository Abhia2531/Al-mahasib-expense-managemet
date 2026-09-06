import Link from "next/link";

import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-14rem)] max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="tnum text-[12px] font-medium uppercase tracking-[0.08em] text-faint">
        404
      </p>
      <h1 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-[13px] text-muted">
        This project or page does not exist. It may have been deleted.
      </p>
      <Link href="/" className={`${btn.base} ${btn.primary} mt-6`}>
        Back to projects
      </Link>
    </div>
  );
}
