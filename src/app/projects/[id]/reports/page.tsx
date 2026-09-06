import { notFound, unstable_rethrow } from "next/navigation";
import type { Metadata } from "next";

import {
  getProjectFinancials,
  listAdvances,
  listAllExpenses,
  listBills,
} from "@/lib/queries";
import {
  BILL_STATUS_LABELS,
  extractQuantity,
  formatDate,
  formatDateLong,
  formatMoney,
  todayISO,
} from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { Note } from "@/components/ui";
import { SetupNotice } from "@/components/SetupNotice";
import type { DailyExpense } from "@/lib/types";

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({
  params,
}: PageProps<"/projects/[id]/reports">) {
  const { id } = await params;

  let project, expenses, advances, bills;
  try {
    [project, expenses, advances, bills] = await Promise.all([
      getProjectFinancials(id),
      listAllExpenses(id),
      listAdvances(id),
      listBills(id),
    ]);
  } catch (error) {
    unstable_rethrow(error);
    return (
      <SetupNotice
        detail={error instanceof Error ? error.message : String(error)}
      />
    );
  }
  if (!project) notFound();

  const byDay = groupByDay(expenses);
  const today = todayISO();
  const empty =
    byDay.length === 0 && advances.length === 0 && bills.length === 0;

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-noprint
      >
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Project report</h2>
          <p className="mt-0.5 text-sm text-muted">
            A4-formatted. Use Print / Save as PDF and choose A4 — the app menus
            are left out automatically.
          </p>
        </div>
        <PrintButton />
      </div>

      {empty ? (
        <Note tone="steel">
          Nothing has been recorded for this project yet, so the report shows
          the project details and zero totals only.
        </Note>
      ) : null}

      <article className="print-sheet mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 text-[13px] leading-relaxed text-ink shadow-[var(--shadow-sm)] sm:p-8">
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Al Mahasib
            </p>
            <h1 className="mt-1 text-[22px] font-bold tracking-[-0.01em] text-ink">
              Project report
            </h1>
          </div>
          <div className="text-right text-[11px] text-muted">
            <p>Generated</p>
            <p className="font-medium text-ink">{formatDateLong(today)}</p>
          </div>
        </header>

        <section className="mt-5">
          <h2 className="text-[16px] font-bold text-ink">
            {project.project_name}
          </h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1.5 text-[12.5px] sm:grid-cols-2">
            <Detail label="Client" value={project.client_name || "—"} />
            <Detail label="Location" value={project.location || "—"} />
            <Detail
              label="Start date"
              value={project.start_date ? formatDate(project.start_date) : "—"}
            />
            <Detail
              label="Project value"
              value={formatMoney(project.contract_value)}
              strong
            />
          </dl>
          {project.description ? (
            <p className="mt-3 whitespace-pre-wrap border-l-2 border-border-strong pl-3 text-[12px] text-ink-2">
              {project.description}
            </p>
          ) : null}
        </section>

        <section className="mt-6">
          <SheetHeading>Financial summary</SheetHeading>
          <table className="mt-2 w-full border-collapse text-[12.5px]">
            <tbody>
              <SumRow label="Project value" value={project.contract_value} />
              <SumRow
                label="Total expenses"
                value={project.total_expenses}
                note={`${project.expense_days} ${
                  project.expense_days === 1 ? "day" : "days"
                }`}
              />
              <SumRow
                label="Total advance received"
                value={project.total_advance_received}
                note={`${advances.length} ${
                  advances.length === 1 ? "payment" : "payments"
                }`}
              />
              <SumRow
                label="Remaining amount  (advance − expenses)"
                value={project.remaining_advance}
                strong
              />
              <SumRow label="Total billed" value={project.total_billed} />
              <SumRow
                label="Billing received"
                value={project.total_billing_received}
              />
              <SumRow
                label="Outstanding amount  (billed − received)"
                value={project.outstanding_billing}
                strong
              />
            </tbody>
          </table>
        </section>

        <section className="mt-6">
          <SheetHeading>
            Expense &amp; purchase history
            <span className="ml-2 font-normal text-muted">
              ({expenses.length} {expenses.length === 1 ? "line" : "lines"})
            </span>
          </SheetHeading>
          {byDay.length === 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              No expenses recorded for this project.
            </p>
          ) : (
            <table className="mt-2 w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-y border-ink text-left">
                  <th className="w-24 py-1.5 pr-2 font-semibold">Date</th>
                  <th className="py-1.5 pr-2 font-semibold">Item / material</th>
                  <th className="w-24 py-1.5 pr-2 font-semibold">Quantity</th>
                  <th className="w-28 py-1.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((day) => (
                  <DayBlock key={day.date} date={day.date} rows={day.rows} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink">
                  <th colSpan={3} className="py-2 text-left font-bold">
                    Total project expenses
                  </th>
                  <td className="tnum py-2 text-right font-bold">
                    {formatMoney(project.total_expenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <section className="mt-6">
          <SheetHeading>Advance payments</SheetHeading>
          {advances.length === 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              No advance payments recorded.
            </p>
          ) : (
            <table className="mt-2 w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-y border-ink text-left">
                  <th className="w-24 py-1.5 pr-2 font-semibold">Date</th>
                  <th className="py-1.5 pr-2 font-semibold">Notes</th>
                  <th className="w-28 py-1.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((a) => (
                  <tr key={a.id} className="border-b border-border align-top">
                    <td className="tnum py-1.5 pr-2">
                      {formatDate(a.payment_date)}
                    </td>
                    <td className="py-1.5 pr-2">{a.notes || "—"}</td>
                    <td className="tnum py-1.5 text-right">
                      {formatMoney(a.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink">
                  <th colSpan={2} className="py-2 text-left font-bold">
                    Total advance received
                  </th>
                  <td className="tnum py-2 text-right font-bold">
                    {formatMoney(project.total_advance_received)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <section className="mt-6">
          <SheetHeading>Progress billing</SheetHeading>
          {bills.length === 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              No progress bills recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[560px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-y border-ink text-left">
                    <th className="py-1.5 pr-2 font-semibold">Bill</th>
                    <th className="w-20 py-1.5 pr-2 font-semibold">Date</th>
                    <th className="w-24 py-1.5 pr-2 font-semibold">Status</th>
                    <th className="w-24 py-1.5 pr-2 text-right font-semibold">
                      Billed
                    </th>
                    <th className="w-24 py-1.5 pr-2 text-right font-semibold">
                      Received
                    </th>
                    <th className="w-24 py-1.5 text-right font-semibold">
                      Outstanding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr key={b.id} className="border-b border-border align-top">
                      <td className="py-1.5 pr-2">
                        <span className="font-medium">{b.bill_number}</span>
                        {b.work_description ? (
                          <span className="block text-[11px] text-muted">
                            {b.work_description}
                          </span>
                        ) : null}
                      </td>
                      <td className="tnum py-1.5 pr-2">
                        {formatDate(b.bill_date)}
                      </td>
                      <td className="py-1.5 pr-2">
                        {BILL_STATUS_LABELS[b.status]}
                      </td>
                      <td className="tnum py-1.5 pr-2 text-right">
                        {formatMoney(b.bill_amount)}
                      </td>
                      <td className="tnum py-1.5 pr-2 text-right">
                        {formatMoney(b.amount_received)}
                      </td>
                      <td className="tnum py-1.5 text-right">
                        {formatMoney(b.bill_amount - b.amount_received)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink">
                    <th colSpan={3} className="py-2 text-left font-bold">
                      Totals
                    </th>
                    <td className="tnum py-2 pr-2 text-right font-bold">
                      {formatMoney(project.total_billed)}
                    </td>
                    <td className="tnum py-2 pr-2 text-right font-bold">
                      {formatMoney(project.total_billing_received)}
                    </td>
                    <td className="tnum py-2 text-right font-bold">
                      {formatMoney(project.outstanding_billing)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-border-strong pt-3 text-[10.5px] text-muted">
          Al Mahasib — construction project finance · {project.project_name} ·
          report generated {formatDate(today)}
        </footer>
      </article>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Detail({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`tnum text-right text-ink ${
          strong ? "font-bold" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function SheetHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-border-strong pb-1 text-[13px] font-bold uppercase tracking-[0.04em] text-ink">
      {children}
    </h3>
  );
}

function SumRow({
  label,
  value,
  note,
  strong,
}: {
  label: string;
  value: number;
  note?: string;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "border-y border-ink" : "border-b border-border"}>
      <th
        scope="row"
        className={`py-1.5 text-left font-normal ${
          strong ? "font-bold text-ink" : "text-ink-2"
        }`}
      >
        {label}
        {note ? (
          <span className="ml-2 text-[11px] text-muted">{note}</span>
        ) : null}
      </th>
      <td
        className={`tnum py-1.5 text-right ${
          strong ? "text-[13px] font-bold" : "font-medium"
        }`}
      >
        {formatMoney(value)}
      </td>
    </tr>
  );
}

function DayBlock({ date, rows }: { date: string; rows: DailyExpense[] }) {
  const subtotal = rows.reduce((sum, r) => sum + r.price, 0);
  return (
    <>
      {rows.map((row, i) => (
        <tr key={row.id} className="border-b border-border align-top">
          <td className="tnum py-1.5 pr-2">{i === 0 ? formatDate(date) : ""}</td>
          <td className="py-1.5 pr-2">{row.material}</td>
          <td className="tnum py-1.5 pr-2 text-muted">
            {extractQuantity(row.material) || "—"}
          </td>
          <td className="tnum py-1.5 text-right">{formatMoney(row.price)}</td>
        </tr>
      ))}
      <tr className="border-b border-border-strong">
        <td />
        <td colSpan={2} className="py-1 pr-2 text-right text-[11px] text-muted">
          Day total
        </td>
        <td className="tnum py-1 text-right text-[11px] font-semibold">
          {formatMoney(subtotal)}
        </td>
      </tr>
    </>
  );
}

function groupByDay(
  expenses: DailyExpense[],
): { date: string; rows: DailyExpense[] }[] {
  const map = new Map<string, DailyExpense[]>();
  for (const e of [...expenses].reverse()) {
    const arr = map.get(e.expense_date) ?? [];
    arr.push(e);
    map.set(e.expense_date, arr);
  }
  return [...map.entries()].map(([date, rows]) => ({ date, rows }));
}
