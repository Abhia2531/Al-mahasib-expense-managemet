"use client";

import { useRef, useState, useTransition } from "react";

import {
  addExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format";
import { btn, ErrorNote, input } from "@/components/ui";
import type { DailyExpense } from "@/lib/types";

/**
 * The Material | Price table for one day.
 *
 * Optimised for repeat entry: after a row is saved the form clears itself and
 * puts the cursor back in Material, so a whole day can be typed without
 * touching the mouse.
 */
export function ExpenseDayTable({
  projectId,
  expenseDate,
  rows,
}: {
  projectId: string;
  expenseDate: string;
  rows: DailyExpense[];
}) {
  const dailyTotal = rows.reduce((sum, row) => sum + row.price, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Materials and prices recorded on this day
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left">
            <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
              Material
            </th>
            <th scope="col" className="w-40 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
              Price
            </th>
            <th scope="col" className="w-24 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted">
                No materials recorded for this day yet. Add the first one below.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <ExpenseRow
                key={row.id}
                row={row}
                projectId={projectId}
                expenseDate={expenseDate}
              />
            ))
          )}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-border-strong bg-accent-soft">
            <th scope="row" className="px-4 py-3.5 text-left text-sm font-semibold text-ink">
              Daily Total
            </th>
            <td className="tnum px-4 py-3.5 text-right text-base font-bold text-ink">
              {formatMoney(dailyTotal)}
            </td>
            <td className="px-4 py-3.5" />
          </tr>
        </tfoot>
      </table>

      <AddExpenseRow projectId={projectId} expenseDate={expenseDate} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ExpenseRow({
  row,
  projectId,
  expenseDate,
}: {
  row: DailyExpense;
  projectId: string;
  expenseDate: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    action: typeof updateExpenseAction | typeof deleteExpenseAction,
    formData: FormData,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const result = await action(idleState, formData);
      if (result.ok) {
        setError(null);
        onSuccess?.();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  if (editing) {
    return (
      <tr className="bg-surface-2">
        <td colSpan={3} className="px-4 py-3">
          <form
            action={(formData) =>
              runAction(updateExpenseAction, formData, () => setEditing(false))
            }
            className="flex flex-wrap items-start gap-2"
          >
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="expense_date" value={expenseDate} />

            <input
              name="material"
              defaultValue={row.material}
              required
              autoFocus
              aria-label="Material"
              className={`${input} min-w-0 flex-1`}
            />
            <input
              name="price"
              defaultValue={String(row.price)}
              inputMode="decimal"
              aria-label="Price"
              className={`${input} tnum w-32 text-right`}
            />
            <button
              type="submit"
              disabled={isPending}
              className={`${btn.base} ${btn.primary} ${btn.small}`}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className={`${btn.base} ${btn.secondary} ${btn.small}`}
            >
              Cancel
            </button>

            {error ? (
              <div className="w-full">
                <ErrorNote>{error}</ErrorNote>
              </div>
            ) : null}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={isPending ? "opacity-50" : undefined}>
      <td className="px-4 py-3 text-ink">{row.material}</td>
      <td className="tnum px-4 py-3 text-right font-medium text-ink">
        {formatMoney(row.price)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {confirmingDelete ? (
            <form
              action={(formData) => runAction(deleteExpenseAction, formData)}
              className="flex items-center gap-1"
            >
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="expense_date" value={expenseDate} />
              <button
                type="submit"
                disabled={isPending}
                className={`${btn.base} ${btn.danger} ${btn.small} font-semibold`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
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
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${row.material}`}
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
        {error && !editing ? (
          <p role="alert" className="mt-1 text-right text-xs text-neg">
            {error}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */

function AddExpenseRow({
  projectId,
  expenseDate,
}: {
  projectId: string;
  expenseDate: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const materialRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addExpenseAction(idleState, formData);
      if (result.ok) {
        setError(null);
        formRef.current?.reset();
        materialRef.current?.focus();
      } else {
        setError(result.error ?? "Could not add this item.");
      }
    });
  }

  return (
    <div className="border-t border-border bg-surface p-4">
      <form ref={formRef} action={handleAdd} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="expense_date" value={expenseDate} />

        <div className="min-w-0 flex-1 basis-48">
          <label
            htmlFor="new-material"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Material
          </label>
          <input
            id="new-material"
            name="material"
            ref={materialRef}
            required
            maxLength={120}
            placeholder="e.g. Cement"
            autoComplete="off"
            className={input}
          />
        </div>

        <div className="w-36">
          <label
            htmlFor="new-price"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Price
          </label>
          <input
            id="new-price"
            name="price"
            inputMode="decimal"
            required
            placeholder="0"
            autoComplete="off"
            className={`${input} tnum text-right`}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`${btn.base} ${btn.primary}`}
        >
          {isPending ? "Adding…" : "Add item"}
        </button>
      </form>

      {error ? (
        <div className="mt-2">
          <ErrorNote>{error}</ErrorNote>
        </div>
      ) : null}
    </div>
  );
}
