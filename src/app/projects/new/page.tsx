import type { Metadata } from "next";
import Link from "next/link";

import { todayISO } from "@/lib/format";
import { NewProjectForm } from "@/components/NewProjectForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.5 3.5L5 8l4.5 4.5" />
          </svg>
          All projects
        </Link>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        New project
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Every expense, advance and bill you record afterwards stays tied to this
        project alone.
      </p>

      <Card className="p-5 sm:p-6">
        <NewProjectForm today={todayISO()} />
      </Card>
    </div>
  );
}
