import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listBills } from "@/lib/queries";
import { todayISO } from "@/lib/format";
import { BillingManager } from "@/components/BillingManager";
import { SectionHeading, StatTile } from "@/components/ui";

export const metadata: Metadata = { title: "Progress billing" };

export default async function BillingPage({
  params,
}: PageProps<"/projects/[id]/billing">) {
  const { id } = await params;

  const [project, bills] = await Promise.all([
    getProjectFinancials(id),
    listBills(id),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Progress billing"
        description="Bills raised against this project, and what has been received on them."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Total billed"
          value={project.total_billed}
          hint={
            project.bill_count === 1
              ? "1 bill"
              : `${project.bill_count} bills`
          }
        />
        <StatTile
          label="Total billing received"
          value={project.total_billing_received}
          tone="pos"
        />
        <StatTile
          label="Outstanding billing"
          value={project.outstanding_billing}
          tone={project.outstanding_billing > 0 ? "warn" : "neutral"}
          hint="Billed − received"
          emphasis
        />
      </div>

      <BillingManager projectId={id} bills={bills} today={todayISO()} />
    </div>
  );
}
