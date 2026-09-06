"use client";

import { useRef, useState, useTransition } from "react";

import {
  addExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format";
import { btn, ErrorNote, Icon, icons, input } from "@/components/ui";
import type { DailyExpense } from "@/lib/types";

/**
 * The Material | Price ledger for one day.
 *
 * Built for repeat entry: the add line stays at the bottom, and after each
 * save it clears and refocuses Material so a whole day can be typed without
 * the mouse.
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
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-[13px]">
        <caption className="sr-only">Materials and prices for this day</caption>
        <thead>
          <tr className="text-[11px] font-medium uppercase tracking-[0.05em] text-faint">
            <th scope="col" className="px-4 py-2 text-left font-medium">
              Material
            </th>
            <th scope="col" className="w-40 px-4 py-2 text-right font-medium">
              Price
            </th>
            <th scope="col" className="w-[8.5rem] px-2 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-border">
              <td colSpan={3} className="px-4 py-7 text-center text-muted">
                No materials on this day yet — add the first below.
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
          <tr className="border-t-2 border-border-strong">
            <th scope="row" className="px-4 py-3 text-left text-[13px] font-semibold text-ink">
              Daily total
            </th>
            <td className="tnum px-4 py-3 text-right text-[15px] font-bold text-ink">
              {formatMoney(dailyTotal)}
            </td>
            <td className="px-2" />
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
      <tr className="border-t border-border bg-surface-2">
        <td colSpan={3} className="px-3 py-2.5">
          <form
            action={(formData) =>
              runAction(updateExpenseAction, formData, () => setEditing(false))
            }
            className="flex flex-wrap items-center gap-2"
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
              autoComplete="off"
              className={`${input} min-w-0 flex-1`}
            />
            <div className="w-28 shrink-0">
              <input
                name="price"
                defaultValue={String(row.price)}
                inputMode="decimal"
                aria-label="Price"
                autoComplete="off"
                className={`${input} tnum text-right`}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className={`${btn.base} ${btn.primary} ${btn.sm}`}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className={`${btn.base} ${btn.ghost} ${btn.sm}`}
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
    <tr
      className={`group border-t border-border transition-colors hover:bg-surface-2 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <td className="px-4 py-2.5 text-ink">{row.material}</td>
      <td className="tnum px-4 py-2.5 text-right font-medium text-ink">
        {formatMoney(row.price)}
      </td>
      <td className="px-2 py-1.5">
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
                className={`${btn.base} ${btn.danger} ${btn.sm} font-semibold`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={`${btn.base} ${btn.ghost} ${btn.sm}`}
              >
                Keep
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`${btn.base} ${btn.ghost} ${btn.sm}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`${btn.base} ${btn.danger} ${btn.sm}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
        {error && !editing ? (
          <p role="alert" aria-live="polite" className="mt-1 text-right text-[11.5px] text-neg">
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
    <div className="border-t border-border-strong bg-surface-2 px-3 py-2.5">
      <form
        ref={formRef}
        action={handleAdd}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="expense_date" value={expenseDate} />

        <input
          id="new-material"
          name="material"
          ref={materialRef}
          required
          maxLength={120}
          placeholder="Material — e.g. Cement"
          aria-label="New material"
          autoComplete="off"
          className={`${input} min-w-0 flex-1 basis-44`}
        />
        <div className="w-28 shrink-0">
          <input
            id="new-price"
            name="price"
            inputMode="decimal"
            required
            placeholder="0"
            aria-label="Price"
            autoComplete="off"
            className={`${input} tnum text-right`}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`${btn.base} ${btn.primary} ${btn.sm}`}
        >
          <Icon path={icons.plus} size={13} />
          {isPending ? "Adding…" : "Add"}
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
