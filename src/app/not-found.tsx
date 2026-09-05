import Link from "next/link";

import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        This project or page does not exist. It may have been deleted.
      </p>
      <Link href="/" className={`${btn.base} ${btn.primary} mt-6`}>
        Back to projects
      </Link>
    </div>
  );
}
