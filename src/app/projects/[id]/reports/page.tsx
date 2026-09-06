import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getProjectFinancials,
  listAdvances,
  listBills,
  listExpenseDays,
} from "@/lib/queries";
import { BILL_STATUS_LABELS, formatDate, formatMoney } from "@/lib/format";
import { Badge, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Reports" };

const headCell =
  "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-faint";
const cell = "px-3 py-2.5 text-[13px] text-ink";
const footRow = "border-t-2 border-border-strong";

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
    <div className="space-y-8">
      <SectionHeading
        title="Financial summary"
        description={`Every figure counts only records belonging to ${project.project_name}.`}
      />

      {/* ---- Summary --------------------------------------------- */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full">
          <tbody>
            <SummaryRow label="Project value" value={project.contract_value} first />

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
              note={`${advances.length} ${advances.length === 1 ? "payment" : "payments"}`}
            />
            <SummaryRow
              label="Remaining advance"
              value={project.remaining_advance}
              note="advance received − project expenses"
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
              note="total billed − total billing received"
              tone={project.outstanding_billing > 0 ? "warn" : "neutral"}
              strong
            />
          </tbody>
        </table>
      </div>

      {/* ---- Expenses by day ----------------------------------- */}
      <ReportSection title="Expenses by day">
        {days.length === 0 ? (
          <EmptyRow>No expenses recorded.</EmptyRow>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={headCell}>Date</th>
                <th scope="col" className={headCell}>Items</th>
                <th scope="col" className={`${headCell} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.expense_date} className="border-t border-border">
                  <td className={cell}>{formatDate(day.expense_date)}</td>
                  <td className={`${cell} tnum text-muted`}>{day.line_count}</td>
                  <td className={`${cell} tnum text-right font-medium`}>
                    {formatMoney(day.daily_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={footRow}>
                <th scope="row" colSpan={2} className="px-3 py-3 text-left text-[13px] font-semibold text-ink">
                  Total project expenses
                </th>
                <td className="tnum px-3 py-3 text-right text-[14px] font-bold text-ink">
                  {formatMoney(project.total_expenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </ReportSection>

      {/* ---- Advances ----------------------------------------- */}
      <ReportSection title="Advance payments">
        {advances.length === 0 ? (
          <EmptyRow>No advance payments recorded.</EmptyRow>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={headCell}>Date</th>
                <th scope="col" className={headCell}>Notes</th>
                <th scope="col" className={`${headCell} text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {advances.map((advance) => (
                <tr key={advance.id} className="border-t border-border">
                  <td className={`${cell} whitespace-nowrap`}>
                    {formatDate(advance.payment_date)}
                  </td>
                  <td className={`${cell} text-muted`}>{advance.notes || "—"}</td>
                  <td className={`${cell} tnum text-right font-medium`}>
                    {formatMoney(advance.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={footRow}>
                <th scope="row" colSpan={2} className="px-3 py-3 text-left text-[13px] font-semibold text-ink">
                  Total advance received
                </th>
                <td className="tnum px-3 py-3 text-right text-[14px] font-bold text-ink">
                  {formatMoney(project.total_advance_received)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </ReportSection>

      {/* ---- Bills -------------------------------------------- */}
      <ReportSection title="Progress bills" scroll>
        {bills.length === 0 ? (
          <EmptyRow>No progress bills recorded.</EmptyRow>
        ) : (
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={headCell}>Bill</th>
                <th scope="col" className={headCell}>Date</th>
                <th scope="col" className={headCell}>Status</th>
                <th scope="col" className={`${headCell} text-right`}>Billed</th>
                <th scope="col" className={`${headCell} text-right`}>Received</th>
                <th scope="col" className={`${headCell} text-right`}>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-t border-border">
                  <td className={`${cell} font-medium`}>{bill.bill_number}</td>
                  <td className={`${cell} whitespace-nowrap text-muted`}>
                    {formatDate(bill.bill_date)}
                  </td>
                  <td className={cell}>
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
                  <td className={`${cell} tnum text-right`}>
                    {formatMoney(bill.bill_amount)}
                  </td>
                  <td className={`${cell} tnum text-right text-pos`}>
                    {formatMoney(bill.amount_received)}
                  </td>
                  <td className={`${cell} tnum text-right font-medium`}>
                    {formatMoney(bill.bill_amount - bill.amount_received)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={footRow}>
                <th scope="row" colSpan={3} className="px-3 py-3 text-left text-[13px] font-semibold text-ink">
                  Totals
                </th>
                <td className="tnum px-3 py-3 text-right text-[13px] font-bold text-ink">
                  {formatMoney(project.total_billed)}
                </td>
                <td className="tnum px-3 py-3 text-right text-[13px] font-bold text-ink">
                  {formatMoney(project.total_billing_received)}
                </td>
                <td className="tnum px-3 py-3 text-right text-[13px] font-bold text-ink">
                  {formatMoney(project.outstanding_billing)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </ReportSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ReportSection({
  title,
  children,
  scroll = false,
}: {
  title: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      <div
        className={`rounded-lg border border-border bg-surface ${
          scroll ? "overflow-x-auto" : "overflow-hidden"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-8 text-center text-[13px] text-muted">{children}</p>
  );
}

function SummaryGroup({ label }: { label: string }) {
  return (
    <tr className="border-t border-border">
      <th
        scope="colgroup"
        colSpan={2}
        className="px-3 pb-1 pt-4 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-faint"
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
  first = false,
}: {
  label: string;
  value: number;
  note?: string;
  tone?: "neutral" | "pos" | "neg" | "warn";
  strong?: boolean;
  first?: boolean;
}) {
  const toneClass = {
    neutral: "text-ink",
    pos: "text-pos",
    neg: "text-neg",
    warn: "text-warn",
  }[tone];

  return (
    <tr className={first ? "" : "border-t border-border"}>
      <th scope="row" className="px-3 py-2.5 text-left align-top font-normal">
        <span
          className={`text-[13px] ${
            strong ? "font-semibold text-ink" : "text-ink-2"
          }`}
        >
          {label}
        </span>
        {note ? (
          <span className="mt-0.5 block text-[11.5px] text-muted">{note}</span>
        ) : null}
      </th>
      <td
        className={`tnum px-3 py-2.5 text-right align-top ${toneClass} ${
          strong ? "text-[14px] font-bold" : "text-[13px] font-medium"
        }`}
      >
        {formatMoney(value)}
      </td>
    </tr>
  );
}
