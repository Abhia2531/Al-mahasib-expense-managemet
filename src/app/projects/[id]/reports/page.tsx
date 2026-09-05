import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getProjectFinancials,
  listAdvances,
  listBills,
  listExpenseDays,
} from "@/lib/queries";
import { BILL_STATUS_LABELS, formatDate, formatMoney } from "@/lib/format";
import { Badge, Card, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({
  params,
}: PageProps<"/projects/[id]/reports">) {
  const { id } = await params;

  const [project, days, advances, bills] = await Promise.all([
    getProjectFinancials(id),
    listExpenseDays(id),
    listAdvances(id),
    listBills(id),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-7">
      <SectionHeading
        title="Financial summary"
        description={`Every figure below counts only records belonging to ${project.project_name}.`}
      />

      {/* ---- The summary table ------------------------------------- */}
      <Card className="overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <tbody className="divide-y divide-border">
            <SummaryRow label="Project value" value={project.contract_value} />

            <SummaryGroup label="Expenses" />
            <SummaryRow
              label="Total project expenses"
              value={project.total_expenses}
              note={`${days.length} ${days.length === 1 ? "day" : "days"} recorded`}
            />

            <SummaryGroup label="Advance" />
            <SummaryRow
              label="Total advance received"
              value={project.total_advance_received}
              note={`${advances.length} ${
                advances.length === 1 ? "payment" : "payments"
              }`}
            />
            <SummaryRow
              label="Remaining advance"
              value={project.remaining_advance}
              note="Advance received − project expenses"
              tone={project.remaining_advance < 0 ? "neg" : "pos"}
              strong
            />

            <SummaryGroup label="Billing" />
            <SummaryRow
              label="Total billed"
              value={project.total_billed}
              note={`${bills.length} ${bills.length === 1 ? "bill" : "bills"}`}
            />
            <SummaryRow
              label="Total billing received"
              value={project.total_billing_received}
            />
            <SummaryRow
              label="Outstanding billing"
              value={project.outstanding_billing}
              note="Total billed − total billing received"
              tone={project.outstanding_billing > 0 ? "warn" : "neutral"}
              strong
            />
          </tbody>
        </table>
      </Card>

      {/* ---- Expenses by day --------------------------------------- */}
      <section>
        <h3 className="mb-3 text-[15px] font-semibold text-ink">
          Expenses by day
        </h3>
        <Card className="overflow-hidden">
          {days.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No expenses recorded.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left">
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Items
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {days.map((day) => (
                  <tr key={day.expense_date}>
                    <td className="px-4 py-2.5 text-ink">
                      {formatDate(day.expense_date)}
                    </td>
                    <td className="tnum px-4 py-2.5 text-muted">
                      {day.line_count}
                    </td>
                    <td className="tnum px-4 py-2.5 text-right font-medium text-ink">
                      {formatMoney(day.daily_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-strong bg-accent-soft">
                  <th scope="row" colSpan={2} className="px-4 py-3 text-left text-sm font-semibold text-ink">
                    Total project expenses
                  </th>
                  <td className="tnum px-4 py-3 text-right text-base font-bold text-ink">
                    {formatMoney(project.total_expenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </section>

      {/* ---- Advances ---------------------------------------------- */}
      <section>
        <h3 className="mb-3 text-[15px] font-semibold text-ink">
          Advance payments
        </h3>
        <Card className="overflow-hidden">
          {advances.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No advance payments recorded.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left">
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {advances.map((advance) => (
                  <tr key={advance.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink">
                      {formatDate(advance.payment_date)}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {advance.notes || "—"}
                    </td>
                    <td className="tnum px-4 py-2.5 text-right font-medium text-ink">
                      {formatMoney(advance.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-strong bg-accent-soft">
                  <th scope="row" colSpan={2} className="px-4 py-3 text-left text-sm font-semibold text-ink">
                    Total advance received
                  </th>
                  <td className="tnum px-4 py-3 text-right text-base font-bold text-ink">
                    {formatMoney(project.total_advance_received)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </section>

      {/* ---- Bills -------------------------------------------------- */}
      <section>
        <h3 className="mb-3 text-[15px] font-semibold text-ink">
          Progress bills
        </h3>
        <Card className="overflow-x-auto">
          {bills.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No progress bills recorded.
            </p>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left">
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Bill
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Billed
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Outstanding
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-4 py-2.5 font-medium text-ink">
                      {bill.bill_number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                      {formatDate(bill.bill_date)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        tone={
                          bill.status === "paid"
                            ? "pos"
                            : bill.status === "partially_paid"
                              ? "accent"
                              : "warn"
                        }
                      >
                        {BILL_STATUS_LABELS[bill.status]}
                      </Badge>
                    </td>
                    <td className="tnum px-4 py-2.5 text-right text-ink">
                      {formatMoney(bill.bill_amount)}
                    </td>
                    <td className="tnum px-4 py-2.5 text-right text-pos">
                      {formatMoney(bill.amount_received)}
                    </td>
                    <td className="tnum px-4 py-2.5 text-right font-medium text-ink">
                      {formatMoney(bill.bill_amount - bill.amount_received)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-strong bg-accent-soft">
                  <th scope="row" colSpan={3} className="px-4 py-3 text-left text-sm font-semibold text-ink">
                    Totals
                  </th>
                  <td className="tnum px-4 py-3 text-right font-bold text-ink">
                    {formatMoney(project.total_billed)}
                  </td>
                  <td className="tnum px-4 py-3 text-right font-bold text-ink">
                    {formatMoney(project.total_billing_received)}
                  </td>
                  <td className="tnum px-4 py-3 text-right font-bold text-ink">
                    {formatMoney(project.outstanding_billing)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SummaryGroup({ label }: { label: string }) {
  return (
    <tr className="bg-surface-2">
      <th
        scope="colgroup"
        colSpan={2}
        className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </th>
    </tr>
  );
}

function SummaryRow({
  label,
  value,
  note,
  tone = "neutral",
  strong = false,
}: {
  label: string;
  value: number;
  note?: string;
  tone?: "neutral" | "pos" | "neg" | "warn";
  strong?: boolean;
}) {
  const toneClass = {
    neutral: "text-ink",
    pos: "text-pos",
    neg: "text-neg",
    warn: "text-warn",
  }[tone];

  return (
    <tr>
      <th scope="row" className="px-4 py-3 text-left align-top font-normal">
        <span className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-2"}`}>
          {label}
        </span>
        {note ? <span className="mt-0.5 block text-xs text-muted">{note}</span> : null}
      </th>
      <td
        className={`tnum px-4 py-3 text-right align-top ${toneClass} ${
          strong ? "text-base font-bold" : "text-sm font-medium"
        }`}
      >
        {formatMoney(value)}
      </td>
    </tr>
  );
}
