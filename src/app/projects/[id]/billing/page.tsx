import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listBills } from "@/lib/queries";
import { todayISO } from "@/lib/format";
import { BillingManager } from "@/components/BillingManager";
import { Figures, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Billing" };

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
    <div className="space-y-5">
      <SectionHeading
        title="Progress billing"
        description="Bills raised against this project, and what has been received on them."
      />

      <Figures
        items={[
          {
            label: "Total billed",
            value: project.total_billed,
            hint: project.bill_count === 1 ? "1 bill" : `${project.bill_count} bills`,
          },
          { label: "Billing received", value: project.total_billing_received, tone: "pos" },
          {
            label: "Outstanding billing",
            value: project.outstanding_billing,
            hint: "billed − received",
            tone: project.outstanding_billing > 0 ? "warn" : "neutral",
            lead: true,
          },
        ]}
      />

      <BillingManager projectId={id} bills={bills} today={todayISO()} />
    </div>
  );
}
