import Link from "next/link";
import type { Metadata } from "next";

import { listExpenseDays } from "@/lib/queries";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import { OpenDayPicker } from "@/components/OpenDayPicker";
import { btn, Card, EmptyState, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Daily expenses" };

export default async function ExpenseHistoryPage({
  params,
}: PageProps<"/projects/[id]/expenses">) {
  const { id } = await params;

  const days = await listExpenseDays(id);
  const today = todayISO();
  const grandTotal = days.reduce((sum, day) => sum + day.daily_total, 0);
  const hasToday = days.some((day) => day.expense_date === today);

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Daily expense pages"
        description="Every day has its own page. Open one to view, add, edit or delete its materials."
        action={
          <Link
            href={`/projects/${id}/expenses/${today}`}
            className={`${btn.base} ${btn.primary}`}
          >
            {hasToday ? "Open today" : "Start today’s page"}
          </Link>
        }
      />

      <Card className="p-4">
        <OpenDayPicker projectId={id} defaultDate={today} />
      </Card>

      <Card className="overflow-hidden">
        {days.length === 0 ? (
          <EmptyState
            title="No expense days yet"
            description="Pick a date above, or start today's page, and add your first material."
            action={
              <Link
                href={`/projects/${id}/expenses/${today}`}
                className={`${btn.base} ${btn.primary}`}
              >
                Start today&rsquo;s page
              </Link>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {days.map((day) => (
                <li key={day.expense_date}>
                  <Link
                    href={`/projects/${id}/expenses/${day.expense_date}`}
                    className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-ink">
                        {formatDate(day.expense_date)}
                        {day.expense_date === today ? (
                          <span className="ml-2 text-xs font-normal text-accent">
                            Today
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted">
                        {day.line_count} {day.line_count === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-[15px] font-semibold text-ink">
                      {formatMoney(day.daily_total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-4 border-t-2 border-border-strong bg-accent-soft px-4 py-3.5">
              <span className="text-sm font-semibold text-ink">
                Total project expenses
              </span>
              <span className="tnum text-base font-bold text-ink">
                {formatMoney(grandTotal)}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
