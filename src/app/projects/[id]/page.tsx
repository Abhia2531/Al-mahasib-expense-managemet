import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectFinancials, listExpenseDays } from "@/lib/queries";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import { btn, Card, EmptyState, SectionHeading, StatTile } from "@/components/ui";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectFinancials(id).catch(() => null);
  return { title: project?.project_name ?? "Project" };
}

export default async function ProjectDashboardPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;

  const project = await getProjectFinancials(id);
  if (!project) notFound();

  const recentDays = (await listExpenseDays(id)).slice(0, 5);
  const today = todayISO();
  const overspent = project.remaining_advance < 0;

  return (
    <div className="space-y-8">
      {/* ---- Advance & expenses ------------------------------------ */}
      <section aria-labelledby="advance-heading">
        <div id="advance-heading">
          <SectionHeading
            title="Advance & expenses"
            description="Money received up front, against what has been spent."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Project value" value={project.contract_value} />
          <StatTile
            label="Total advance received"
            value={project.total_advance_received}
          />
          <StatTile
            label="Total expenses"
            value={project.total_expenses}
            hint={
              project.expense_days === 1
                ? "across 1 day"
                : `across ${project.expense_days} days`
            }
          />
          <StatTile
            label="Remaining advance"
            value={project.remaining_advance}
            tone={overspent ? "neg" : "pos"}
            hint="Advance − expenses"
            emphasis
          />
        </div>

        {overspent ? (
          <p className="mt-3 rounded-lg border border-neg/25 bg-neg-soft px-3.5 py-2.5 text-sm text-neg">
            Expenses have gone past the advance received by{" "}
            <span className="tnum font-semibold">
              {formatMoney(Math.abs(project.remaining_advance))}
            </span>
            . Record another advance payment, or review this project&rsquo;s
            expenses.
          </p>
        ) : null}
      </section>

      {/* ---- Billing ------------------------------------------------ */}
      <section aria-labelledby="billing-heading">
        <div id="billing-heading">
          <SectionHeading
            title="Progress billing"
            description="What has been billed to the client, and what is still owed."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Total billed"
            value={project.total_billed}
            hint={
              project.bill_count === 1
                ? "1 bill raised"
                : `${project.bill_count} bills raised`
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
      </section>

      {/* ---- Recent expense days ------------------------------------ */}
      <section aria-labelledby="recent-heading">
        <div id="recent-heading">
          <SectionHeading
            title="Recent expense days"
            action={
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/projects/${id}/expenses/${today}`}
                  className={`${btn.base} ${btn.primary}`}
                >
                  Enter today&rsquo;s expenses
                </Link>
                <Link
                  href={`/projects/${id}/expenses`}
                  className={`${btn.base} ${btn.secondary}`}
                >
                  All days
                </Link>
              </div>
            }
          />
        </div>

        <Card>
          {recentDays.length === 0 ? (
            <EmptyState
              title="No expenses recorded yet"
              description="Each day gets its own page. Open today's page and start adding materials."
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
            <ul className="divide-y divide-border">
              {recentDays.map((day) => (
                <li key={day.expense_date}>
                  <Link
                    href={`/projects/${id}/expenses/${day.expense_date}`}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {formatDate(day.expense_date)}
                        {day.expense_date === today ? (
                          <span className="ml-2 text-xs font-normal text-accent">
                            Today
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted">
                        {day.line_count}{" "}
                        {day.line_count === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-sm font-semibold text-ink">
                      {formatMoney(day.daily_total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {project.description ? (
        <section aria-labelledby="about-heading">
          <div id="about-heading">
            <SectionHeading title="Project description" />
          </div>
          <Card className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
              {project.description}
            </p>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
