"use client";

import { useRef, useState, useTransition } from "react";

import {
  addBillAction,
  deleteBillAction,
  updateBillAction,
} from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { BILL_STATUS_LABELS, formatDate, formatMoney } from "@/lib/format";
import { Badge, btn, Card, ErrorNote, Field, input } from "@/components/ui";
import type { BillStatus, ProgressBill } from "@/lib/types";

const statusTone: Record<BillStatus, "warn" | "accent" | "pos"> = {
  pending: "warn",
  partially_paid: "accent",
  paid: "pos",
};

export function BillingManager({
  projectId,
  bills,
  today,
}: {
  projectId: string;
  bills: ProgressBill[];
  today: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={`${btn.base} ${btn.primary}`}
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
            Add bill
          </button>
        ) : null}
      </div>

      {adding ? (
        <Card className="p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-ink">New bill</h3>
          <BillForm
            projectId={projectId}
            today={today}
            mode="add"
            onDone={() => setAdding(false)}
          />
        </Card>
      ) : null}

      {bills.length === 0 ? (
        <Card>
          <p className="px-4 py-10 text-center text-sm text-muted">
            No progress bills recorded for this project yet.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {bills.map((bill) => (
            <li key={bill.id}>
              <BillCard bill={bill} projectId={projectId} today={today} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BillCard({
  bill,
  projectId,
  today,
}: {
  bill: ProgressBill;
  projectId: string;
  today: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const outstanding = bill.bill_amount - bill.amount_received;

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      const result = await deleteBillAction(idleState, formData);
      if (result.ok) setError(null);
      else setError(result.error ?? "Could not delete this bill.");
    });
  }

  if (editing) {
    return (
      <Card className="p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-ink">
          Edit bill {bill.bill_number}
        </h3>
        <BillForm
          projectId={projectId}
          today={today}
          mode="edit"
          bill={bill}
          onDone={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className={`p-4 sm:p-5 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink">
              Bill {bill.bill_number}
            </h3>
            <Badge tone={statusTone[bill.status]}>
              {BILL_STATUS_LABELS[bill.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {formatDate(bill.bill_date)}
            {bill.progress_percentage > 0
              ? ` · ${bill.progress_percentage}% complete`
              : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {confirming ? (
            <form action={handleDelete} className="flex items-center gap-1">
              <input type="hidden" name="id" value={bill.id} />
              <input type="hidden" name="project_id" value={projectId} />
              <button
                type="submit"
                disabled={isPending}
                className={`${btn.base} ${btn.danger} ${btn.small} font-semibold`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={`${btn.base} ${btn.ghost} ${btn.small}`}
              >
                Keep
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`${btn.base} ${btn.ghost} ${btn.small}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Delete bill ${bill.bill_number}`}
                className={`${btn.base} ${btn.danger} ${btn.small}`}
              >
                <svg
                  aria-hidden="true"
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8h5.8l.6-8" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {bill.work_description ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {bill.work_description}
        </p>
      ) : null}

      {bill.progress_percentage > 0 ? (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="img"
          aria-label={`${bill.progress_percentage}% complete`}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(bill.progress_percentage, 100)}%` }}
          />
        </div>
      ) : null}

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3.5">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Bill amount
          </dt>
          <dd className="tnum mt-0.5 text-sm font-semibold text-ink">
            {formatMoney(bill.bill_amount)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Received
          </dt>
          <dd className="tnum mt-0.5 text-sm font-semibold text-pos">
            {formatMoney(bill.amount_received)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Outstanding
          </dt>
          <dd
            className={`tnum mt-0.5 text-sm font-semibold ${
              outstanding > 0 ? "text-warn" : "text-ink"
            }`}
          >
            {formatMoney(outstanding)}
          </dd>
        </div>
      </dl>

      {bill.notes ? (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
          {bill.notes}
        </p>
      ) : null}

      {error ? (
        <div className="mt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

/** Shared by "new bill" and "edit bill" — one layout, one set of rules. */
function BillForm({
  projectId,
  today,
  mode,
  bill,
  onDone,
}: {
  projectId: string;
  today: string;
  mode: "add" | "edit";
  bill?: ProgressBill;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = mode === "add" ? addBillAction : updateBillAction;
      const result = await action(idleState, formData);
      if (result.ok) {
        setError(null);
        formRef.current?.reset();
        onDone();
      } else {
        setError(result.error ?? "Could not save this bill.");
      }
    });
  }

  const prefix = mode === "edit" && bill ? `edit-${bill.id}` : "new-bill";

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />
      {bill ? <input type="hidden" name="id" value={bill.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field htmlFor={`${prefix}-number`} label="Bill number">
          <input
            id={`${prefix}-number`}
            name="bill_number"
            required
            maxLength={40}
            defaultValue={bill?.bill_number}
            placeholder="e.g. IPC-01"
            autoComplete="off"
            className={input}
          />
        </Field>

        <Field htmlFor={`${prefix}-date`} label="Bill date">
          <input
            id={`${prefix}-date`}
            name="bill_date"
            type="date"
            defaultValue={bill?.bill_date ?? today}
            className={input}
          />
        </Field>

        <Field htmlFor={`${prefix}-progress`} label="Progress %">
          <input
            id={`${prefix}-progress`}
            name="progress_percentage"
            inputMode="decimal"
            defaultValue={bill ? String(bill.progress_percentage) : ""}
            placeholder="0"
            autoComplete="off"
            className={`${input} tnum`}
          />
        </Field>
      </div>

      <Field htmlFor={`${prefix}-work`} label="Work description">
        <textarea
          id={`${prefix}-work`}
          name="work_description"
          rows={2}
          maxLength={1000}
          defaultValue={bill?.work_description}
          placeholder="e.g. Grey structure — ground floor slab complete"
          className="w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent outline-none"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor={`${prefix}-amount`} label="Bill amount">
          <input
            id={`${prefix}-amount`}
            name="bill_amount"
            inputMode="decimal"
            required
            defaultValue={bill ? String(bill.bill_amount) : ""}
            placeholder="0"
            autoComplete="off"
            className={`${input} tnum`}
          />
        </Field>

        <Field
          htmlFor={`${prefix}-received`}
          label="Amount received"
          hint="Status is set from this: none → Pending, part → Partially Paid, full → Paid."
        >
          <input
            id={`${prefix}-received`}
            name="amount_received"
            inputMode="decimal"
            defaultValue={bill ? String(bill.amount_received) : ""}
            placeholder="0"
            autoComplete="off"
            className={`${input} tnum`}
          />
        </Field>
      </div>

      <Field htmlFor={`${prefix}-notes`} label="Notes" hint="Optional.">
        <input
          id={`${prefix}-notes`}
          name="notes"
          maxLength={200}
          defaultValue={bill?.notes}
          placeholder="e.g. Submitted to consultant on 03-Sep"
          autoComplete="off"
          className={input}
        />
      </Field>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={`${btn.base} ${btn.primary}`}
        >
          {isPending ? "Saving…" : mode === "add" ? "Save bill" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={`${btn.base} ${btn.secondary}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
