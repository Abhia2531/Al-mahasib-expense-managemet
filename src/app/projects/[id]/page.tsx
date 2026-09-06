import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listExpenseDays } from "@/lib/queries";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import {
  btn,
  EmptyState,
  Figures,
  Icon,
  icons,
  Note,
  SectionHeading,
} from "@/components/ui";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectFinancials(id).catch((e) => {
    unstable_rethrow(e);
    return null;
  });
  return { title: project?.project_name ?? "Project" };
}

export default async function ProjectDashboardPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;

  // Fired together — getProjectFinancials is shared (cached) with the layout.
  const [project, allDays] = await Promise.all([
    getProjectFinancials(id),
    listExpenseDays(id),
  ]);
  if (!project) notFound();

  const recentDays = allDays.slice(0, 6);
  const today = todayISO();
  const overspent = project.remaining_advance < 0;

  return (
    <div className="space-y-9">
      {/* ---- Money -------------------------------------------------- */}
      <section aria-labelledby="money-heading" className="space-y-3">
        <SectionHeading
          id="money-heading"
          title="Advance & expenses"
          description="Money received up front against what has been spent."
        />
        <Figures
          items={[
            { label: "Project value", value: project.contract_value },
            { label: "Advance received", value: project.total_advance_received },
            {
              label: "Total expenses",
              value: project.total_expenses,
              hint:
                project.expense_days === 1
                  ? "1 day recorded"
                  : `${project.expense_days} days recorded`,
            },
            {
              label: "Remaining advance",
              value: project.remaining_advance,
              hint: "advance − expenses",
              tone: overspent ? "neg" : "pos",
              lead: true,
            },
          ]}
        />
        {overspent ? (
          <Note tone="neg">
            Expenses have passed the advance received by{" "}
            <span className="tnum font-semibold text-neg">
              {formatMoney(Math.abs(project.remaining_advance))}
            </span>
            . Record another advance, or review this project&rsquo;s expenses.
          </Note>
        ) : null}
      </section>

      {/* ---- Billing ---------------------------------------------- */}
      <section aria-labelledby="billing-heading" className="space-y-3">
        <SectionHeading
          id="billing-heading"
          title="Progress billing"
          description="What has been billed to the client, and what is still owed."
        />
        <Figures
          items={[
            {
              label: "Total billed",
              value: project.total_billed,
              hint:
                project.bill_count === 1
                  ? "1 bill"
                  : `${project.bill_count} bills`,
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
      </section>

      {/* ---- Recent days ----------------------------------------- */}
      <section aria-labelledby="recent-heading" className="space-y-3">
        <SectionHeading
          id="recent-heading"
          title="Recent expense days"
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${id}/expenses/${today}`}
                className={`${btn.base} ${btn.primary}`}
              >
                Enter today
              </Link>
              <Link
                href={`/projects/${id}/expenses`}
                className={`${btn.base} ${btn.ghost}`}
              >
                All days
              </Link>
            </div>
          }
        />

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {recentDays.length === 0 ? (
            <EmptyState
              title="No expenses recorded yet"
              description="Each day has its own page. Open today's and start adding materials."
              action={
                <Link
                  href={`/projects/${id}/expenses/${today}`}
                  className={`${btn.base} ${btn.primary}`}
                >
                  Open today&rsquo;s page
                </Link>
              }
            />
          ) : (
            <ul>
              {recentDays.map((day) => (
                <li key={day.expense_date} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/projects/${id}/expenses/${day.expense_date}`}
                    className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="text-[13.5px] font-medium text-ink">
                        {formatDate(day.expense_date)}
                        {day.expense_date === today ? (
                          <span className="ml-2 text-[11px] font-medium text-accent">
                            today
                          </span>
                        ) : null}
                      </span>
                      <span className="tnum ml-2 text-[12px] text-muted">
                        {day.line_count} {day.line_count === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tnum text-[13px] font-semibold text-ink">
                        {formatMoney(day.daily_total)}
                      </span>
                      <span className="text-faint transition-colors group-hover:text-ink-2">
                        <Icon path={icons.chevronRight} size={14} />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {project.description ? (
        <section aria-labelledby="about-heading" className="space-y-2">
          <SectionHeading id="about-heading" title="Project description" />
          <p className="max-w-prose whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">
            {project.description}
          </p>
        </section>
      ) : null}
    </div>
  );
}
