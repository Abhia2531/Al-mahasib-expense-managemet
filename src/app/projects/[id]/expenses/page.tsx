import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { listExpenseDays, searchExpenses } from "@/lib/queries";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import { OpenDayPicker } from "@/components/OpenDayPicker";
import { ExpenseSearch } from "@/components/ExpenseSearch";
import { btn, EmptyState, Icon, icons, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Daily expenses" };

export default async function ExpenseHistoryPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]/expenses">) {
  const { id } = await params;
  const sp = await searchParams;
  const find = typeof sp?.find === "string" ? sp.find.trim() : "";

  const today = todayISO();

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Daily expenses"
        description="One page per day. Or search to find when an item was bought."
        action={
          <Link
            href={`/projects/${id}/expenses/${today}`}
            className={`${btn.base} ${btn.primary}`}
          >
            <Icon path={icons.plus} size={15} />
            Add expense
          </Link>
        }
      />

      <Suspense fallback={<div className="h-11" />}>
        <ExpenseSearch projectId={id} initial={find} />
      </Suspense>

      {find ? (
        <SearchResults projectId={id} term={find} />
      ) : (
        <DayList projectId={id} today={today} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function SearchResults({
  projectId,
  term,
}: {
  projectId: string;
  term: string;
}) {
  const hits = await searchExpenses(projectId, term);
  const total = hits.reduce((sum, h) => sum + h.price, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <p className="text-[13px] text-ink-2">
          <span className="tnum font-semibold text-ink">{hits.length}</span>{" "}
          {hits.length === 1 ? "purchase" : "purchases"} matching{" "}
          <span className="font-semibold text-ink">“{term}”</span>
        </p>
        {hits.length > 0 ? (
          <p className="tnum text-[13px] font-semibold text-ink">
            {formatMoney(total)}
          </p>
        ) : null}
      </div>

      {hits.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          No purchases match that. Try fewer letters, or a simpler word.
        </p>
      ) : (
        <ul>
          {hits.map((hit) => (
            <li
              key={hit.id}
              className="border-t border-border first:border-t-0"
            >
              <Link
                href={`/projects/${projectId}/expenses/${hit.expense_date}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">
                    {hit.material}
                  </span>
                  <span className="tnum text-[12.5px] text-steel">
                    {formatDate(hit.expense_date)}
                  </span>
                </span>
                <span className="tnum shrink-0 text-[14px] font-semibold text-ink">
                  {formatMoney(hit.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function DayList({
  projectId,
  today,
}: {
  projectId: string;
  today: string;
}) {
  const days = await listExpenseDays(projectId);
  const grandTotal = days.reduce((sum, day) => sum + day.daily_total, 0);

  return (
    <>
      <div className="rounded-lg border border-border bg-surface p-4">
        <OpenDayPicker projectId={projectId} defaultDate={today} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {days.length === 0 ? (
          <EmptyState
            title="No expense days yet"
            description="Pick a date above, or start today's page, and add the first material."
            action={
              <Link
                href={`/projects/${projectId}/expenses/${today}`}
                className={`${btn.base} ${btn.primary}`}
              >
                <Icon path={icons.plus} size={15} />
                Add expense
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
                    href={`/projects/${projectId}/expenses/${day.expense_date}`}
                    className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="text-[14px] font-medium text-ink">
                        {formatDate(day.expense_date)}
                        {day.expense_date === today ? (
                          <span className="ml-2 text-[11.5px] font-semibold text-steel">
                            today
                          </span>
                        ) : null}
                      </span>
                      <span className="tnum ml-2 text-[12.5px] text-muted">
                        {day.line_count} {day.line_count === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tnum text-[14px] font-semibold text-ink">
                        {formatMoney(day.daily_total)}
                      </span>
                      <span className="text-faint transition-colors group-hover:text-ink-2">
                        <Icon path={icons.chevronRight} size={15} />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-4 border-t-2 border-border-strong bg-surface-2 px-4 py-3">
              <span className="text-[14px] font-semibold text-ink">
                Total project expenses
              </span>
              <span className="tnum text-[16px] font-bold text-ink">
                {formatMoney(grandTotal)}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
