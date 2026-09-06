"use client";

import { useRef, useState, useTransition } from "react";

import { addAdvanceAction, deleteAdvanceAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { formatDate, formatMoney } from "@/lib/format";
import { btn, Card, ErrorNote, Field, input } from "@/components/ui";
import type { Advance } from "@/lib/types";

export function AdvancesManager({
  projectId,
  advances,
  today,
}: {
  projectId: string;
  advances: Advance[];
  today: string;
}) {
  const total = advances.reduce((sum, advance) => sum + advance.amount, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_312px] lg:items-start">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {advances.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-muted">
            No advance payments recorded for this project yet.
          </p>
        ) : (
          <>
            <ul>
              {advances.map((advance) => (
                <AdvanceRow
                  key={advance.id}
                  advance={advance}
                  projectId={projectId}
                />
              ))}
            </ul>
            <div className="flex items-center justify-between gap-4 border-t-2 border-border-strong px-4 py-3">
              <span className="text-[13px] font-semibold text-ink">
                Total advance received
              </span>
              <span className="tnum text-[15px] font-bold text-ink">
                {formatMoney(total)}
              </span>
            </div>
          </>
        )}
      </div>

      <AddAdvanceForm projectId={projectId} today={today} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AdvanceRow({
  advance,
  projectId,
}: {
  advance: Advance;
  projectId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      const result = await deleteAdvanceAction(idleState, formData);
      if (result.ok) setError(null);
      else setError(result.error ?? "Could not delete this payment.");
    });
  }

  return (
    <li
      className={`border-t border-border px-4 py-3 first:border-t-0 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-col gap-2 xs:flex-row xs:items-start xs:justify-between xs:gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">
            {formatDate(advance.payment_date)}
          </p>
          {advance.notes ? (
            <p className="mt-0.5 break-words text-[12px] text-muted">
              {advance.notes}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 xs:justify-end">
          <span className="tnum text-[14px] font-semibold text-pos xs:text-[13px]">
            {formatMoney(advance.amount)}
          </span>

          {confirming ? (
            <form action={handleDelete} className="flex items-center gap-1.5">
              <input type="hidden" name="id" value={advance.id} />
              <input type="hidden" name="project_id" value={projectId} />
              <button
                type="submit"
                disabled={isPending}
                className={`${btn.base} ${btn.danger} ${btn.sm} font-semibold`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={`${btn.base} ${btn.ghost} ${btn.sm}`}
              >
                Keep
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={`${btn.base} ${btn.danger} ${btn.sm}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-2">
          <ErrorNote>{error}</ErrorNote>
        </div>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */

function AddAdvanceForm({
  projectId,
  today,
}: {
  projectId: string;
  today: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addAdvanceAction(idleState, formData);
      if (result.ok) {
        setError(null);
        formRef.current?.reset();
      } else {
        setError(result.error ?? "Could not record this payment.");
      }
    });
  }

  return (
    <Card className="p-4">
      <h3 className="text-[13.5px] font-semibold text-ink">Record an advance</h3>
      <p className="mt-0.5 mb-3.5 text-[12px] text-muted">
        Added to this project&rsquo;s total advance received.
      </p>

      <form ref={formRef} action={handleAdd} className="space-y-3.5">
        <input type="hidden" name="project_id" value={projectId} />

        <Field htmlFor="advance-amount" label="Amount">
          <input
            id="advance-amount"
            name="amount"
            inputMode="decimal"
            required
            placeholder="0"
            autoComplete="off"
            className={`${input} tnum`}
          />
        </Field>

        <Field htmlFor="advance-date" label="Payment date">
          <input
            id="advance-date"
            name="payment_date"
            type="date"
            defaultValue={today}
            className={input}
          />
        </Field>

        <Field htmlFor="advance-notes" label="Notes" hint="Optional.">
          <input
            id="advance-notes"
            name="notes"
            maxLength={200}
            placeholder="e.g. Cheque no. 4471"
            autoComplete="off"
            className={input}
          />
        </Field>

        {error ? <ErrorNote>{error}</ErrorNote> : null}

        <button
          type="submit"
          disabled={isPending}
          className={`${btn.base} ${btn.primary} w-full`}
        >
          {isPending ? "Saving…" : "Add advance"}
        </button>
      </form>
    </Card>
  );
}
