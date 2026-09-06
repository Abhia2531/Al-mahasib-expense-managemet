import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listAdvances } from "@/lib/queries";
import { todayISO } from "@/lib/format";
import { AdvancesManager } from "@/components/AdvancesManager";
import { Figures, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Advances" };

export default async function AdvancesPage({
  params,
}: PageProps<"/projects/[id]/advances">) {
  const { id } = await params;

  const [project, advances] = await Promise.all([
    getProjectFinancials(id),
    listAdvances(id),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Advance payments"
        description="Money received from the client before or during the work."
      />

      <Figures
        items={[
          { label: "Advance received", value: project.total_advance_received },
          { label: "Total expenses", value: project.total_expenses },
          {
            label: "Remaining advance",
            value: project.remaining_advance,
            hint: "advance − expenses",
            tone: project.remaining_advance < 0 ? "neg" : "pos",
            lead: true,
          },
        ]}
      />

      <AdvancesManager projectId={id} advances={advances} today={todayISO()} />
    </div>
  );
}
