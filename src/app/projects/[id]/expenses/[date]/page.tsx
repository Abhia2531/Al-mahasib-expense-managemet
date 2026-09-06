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
import { Icon, icons } from "@/components/ui";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]/expenses/[date]">): Promise<Metadata> {
  const { date } = await params;
  return { title: `Expenses · ${formatDate(date)}` };
}

export default async function ExpenseDayPage({
  params,
}: PageProps<"/projects/[id]/expenses/[date]">) {
  const { id, date } = await params;

  if (!isValidISODate(date)) notFound();

  const rows = await listExpensesForDay(id, date);
  const today = todayISO();
  const previousDay = shiftISODate(date, -1);
  const nextDay = shiftISODate(date, 1);
  const base = `/projects/${id}/expenses`;

  const step =
    "grid h-8 w-8 place-items-center text-muted transition-colors hover:bg-surface-2 hover:text-ink";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={base}
            className="inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <Icon path={icons.chevronLeft} size={13} />
            All expense days
          </Link>
          <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-ink">
            {formatDate(date)}
            {date === today ? (
              <span className="ml-2 align-middle text-[11px] font-medium text-accent">
                today
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">{formatDateLong(date)}</p>
        </div>

        <nav
          aria-label="Change day"
          className="flex items-center overflow-hidden rounded-md border border-border-strong bg-surface"
        >
          <Link
            href={`${base}/${previousDay}`}
            className={step}
            aria-label={`Previous day, ${formatDate(previousDay)}`}
          >
            <Icon path={icons.chevronLeft} size={14} />
          </Link>
          {date !== today ? (
            <Link
              href={`${base}/${today}`}
              className="border-x border-border px-2.5 text-[12px] font-medium leading-8 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              Today
            </Link>
          ) : null}
          <Link
            href={`${base}/${nextDay}`}
            className={`${step} border-l border-border`}
            aria-label={`Next day, ${formatDate(nextDay)}`}
          >
            <Icon path={icons.chevronRight} size={14} />
          </Link>
        </nav>
      </div>

      <ExpenseDayTable projectId={id} expenseDate={date} rows={rows} />

      <p className="text-[11.5px] text-faint">
        This page holds only {formatDate(date)}. Other dates have their own pages;
        every item here counts towards this project alone.
      </p>
    </div>
  );
}
