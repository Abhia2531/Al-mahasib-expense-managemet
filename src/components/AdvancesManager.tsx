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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Card className="overflow-hidden">
        {advances.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No advance payments recorded for this project yet.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {advances.map((advance) => (
                <AdvanceRow
                  key={advance.id}
                  advance={advance}
                  projectId={projectId}
                />
              ))}
            </ul>
            <div className="flex items-center justify-between gap-4 border-t-2 border-border-strong bg-accent-soft px-4 py-3.5">
              <span className="text-sm font-semibold text-ink">
                Total advance received
              </span>
              <span className="tnum text-base font-bold text-ink">
                {formatMoney(total)}
              </span>
            </div>
          </>
        )}
      </Card>

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
    <li className={`px-4 py-3.5 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {formatDate(advance.payment_date)}
          </p>
          {advance.notes ? (
            <p className="mt-0.5 text-sm text-muted">{advance.notes}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="tnum text-sm font-semibold text-pos">
            {formatMoney(advance.amount)}
          </span>

          {confirming ? (
            <form action={handleDelete} className="flex items-center gap-1">
              <input type="hidden" name="id" value={advance.id} />
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
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete advance of ${formatMoney(advance.amount)}`}
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
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold text-ink">Record an advance</h3>
      <p className="mt-1 mb-4 text-sm text-muted">
        Added to this project&rsquo;s total advance received.
      </p>

      <form ref={formRef} action={handleAdd} className="space-y-4">
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
