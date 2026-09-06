import Link from "next/link";
import type { Metadata } from "next";

import { listExpenseDays } from "@/lib/queries";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import { OpenDayPicker } from "@/components/OpenDayPicker";
import { btn, EmptyState, Icon, icons, SectionHeading } from "@/components/ui";

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
    <div className="space-y-5">
      <SectionHeading
        title="Daily expense pages"
        description="One page per day. Open one to view, add, edit or delete its materials."
        action={
          <Link
            href={`/projects/${id}/expenses/${today}`}
            className={`${btn.base} ${btn.primary}`}
          >
            {hasToday ? "Open today" : "Start today"}
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-4">
        <OpenDayPicker projectId={id} defaultDate={today} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {days.length === 0 ? (
          <EmptyState
            title="No expense days yet"
            description="Pick a date above, or start today's page, and add the first material."
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
            <ul>
              {days.map((day) => (
                <li
                  key={day.expense_date}
                  className="border-t border-border first:border-t-0"
                >
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

            <div className="flex items-center justify-between gap-4 border-t-2 border-border-strong px-4 py-3">
              <span className="text-[13px] font-semibold text-ink">
                Total project expenses
              </span>
              <span className="tnum text-[15px] font-bold text-ink">
                {formatMoney(grandTotal)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
