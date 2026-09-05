import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listAdvances } from "@/lib/queries";
import { todayISO } from "@/lib/format";
import { AdvancesManager } from "@/components/AdvancesManager";
import { SectionHeading, StatTile } from "@/components/ui";

export const metadata: Metadata = { title: "Advance payments" };

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
    <div className="space-y-6">
      <SectionHeading
        title="Advance payments"
        description="Money received from the client before or during the work."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Total advance received"
          value={project.total_advance_received}
        />
        <StatTile label="Total expenses" value={project.total_expenses} />
        <StatTile
          label="Remaining advance"
          value={project.remaining_advance}
          tone={project.remaining_advance < 0 ? "neg" : "pos"}
          hint="Advance − expenses"
          emphasis
        />
      </div>

      <AdvancesManager
        projectId={id}
        advances={advances}
        today={todayISO()}
      />
    </div>
  );
}
