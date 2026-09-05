import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { listExpensesForDay } from "@/lib/queries";
import {
  formatDate,
  formatDateLong,
  isValidISODate,
  shiftISODate,
  todayISO,
} from "@/lib/format";
import { ExpenseDayTable } from "@/components/ExpenseDayTable";
import { btn } from "@/components/ui";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]/expenses/[date]">): Promise<Metadata> {
  const { date } = await params;
  return { title: `Expenses ${formatDate(date)}` };
}

export default async function ExpenseDayPage({
  params,
}: PageProps<"/projects/[id]/expenses/[date]">) {
  const { id, date } = await params;

  // The date is the page's identity, so a malformed one is a 404 rather than
  // a silently empty page.
  if (!isValidISODate(date)) notFound();

  const rows = await listExpensesForDay(id, date);
  const today = todayISO();
  const previousDay = shiftISODate(date, -1);
  const nextDay = shiftISODate(date, 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/projects/${id}/expenses`}
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
            All expense days
          </Link>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {formatDate(date)}
            {date === today ? (
              <span className="ml-2.5 align-middle text-xs font-medium text-accent">
                Today
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-sm text-muted">{formatDateLong(date)}</p>
        </div>

        <nav aria-label="Change day" className="flex items-center gap-2">
          <Link
            href={`/projects/${id}/expenses/${previousDay}`}
            className={`${btn.base} ${btn.secondary} ${btn.small}`}
            aria-label={`Previous day, ${formatDate(previousDay)}`}
          >
            ‹ Previous
          </Link>
          {date !== today ? (
            <Link
              href={`/projects/${id}/expenses/${today}`}
              className={`${btn.base} ${btn.secondary} ${btn.small}`}
            >
              Today
            </Link>
          ) : null}
          <Link
            href={`/projects/${id}/expenses/${nextDay}`}
            className={`${btn.base} ${btn.secondary} ${btn.small}`}
            aria-label={`Next day, ${formatDate(nextDay)}`}
          >
            Next ›
          </Link>
        </nav>
      </div>

      <ExpenseDayTable projectId={id} expenseDate={date} rows={rows} />

      <p className="text-xs text-muted">
        This page holds only {formatDate(date)}. Other dates have their own
        pages, and every item here counts towards this project alone.
      </p>
    </div>
  );
}
