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
 * A responsive list, not a `<table>`: on phones each entry stacks (name on
 * top, then price + actions); from 640px it's a single aligned row. Built for
 * repeat entry — the add line stays at the bottom and refocuses Material
 * after each save.
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
      <div
        aria-hidden="true"
        className="hidden gap-3 border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-faint sm:flex"
      >
        <span className="flex-1">Material</span>
        <span className="w-36 text-right">Price</span>
        <span className="w-[7.5rem]" />
      </div>

      <ul>
        {rows.length === 0 ? (
          <li className="px-4 py-7 text-center text-[13px] text-muted">
            No materials on this day yet — add the first one below.
          </li>
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
      </ul>

      <div className="flex items-center justify-between gap-3 border-t-2 border-border-strong px-4 py-3">
        <span className="text-[13px] font-semibold text-ink">Daily total</span>
        <span className="tnum text-[15px] font-bold text-ink">
          {formatMoney(dailyTotal)}
        </span>
      </div>

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
      <li className="border-t border-border bg-surface-2 px-3 py-2.5 first:border-t-0">
        <form
          action={(formData) =>
            runAction(updateExpenseAction, formData, () => setEditing(false))
          }
          className="flex flex-col gap-2 xs:flex-row xs:flex-wrap xs:items-center"
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
            className={`${input} min-w-0 xs:flex-1`}
          />
          <input
            name="price"
            defaultValue={String(row.price)}
            inputMode="decimal"
            aria-label="Price"
            autoComplete="off"
            className={`${input} tnum w-full text-right xs:w-28`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className={`${btn.base} ${btn.primary} ${btn.sm} flex-1 xs:flex-none`}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className={`${btn.base} ${btn.ghost} ${btn.sm} flex-1 xs:flex-none`}
            >
              Cancel
            </button>
          </div>

          {error ? (
            <div className="w-full">
              <ErrorNote>{error}</ErrorNote>
            </div>
          ) : null}
        </form>
      </li>
    );
  }

  return (
    <li
      className={`flex flex-col gap-1.5 border-t border-border px-4 py-3 transition-colors first:border-t-0 hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-3 sm:py-2.5 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <span className="min-w-0 break-words text-[13.5px] text-ink sm:flex-1 sm:text-[13px]">
        {row.material}
      </span>

      <div className="flex items-center justify-between gap-3 sm:contents">
        <span className="tnum text-[14px] font-semibold text-ink sm:w-36 sm:text-right sm:text-[13px] sm:font-medium">
          {formatMoney(row.price)}
        </span>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:w-[7.5rem]">
          {confirmingDelete ? (
            <form
              action={(formData) => runAction(deleteExpenseAction, formData)}
              className="flex items-center gap-1.5"
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
                aria-label={`Edit ${row.material}`}
                className={`${btn.base} ${btn.ghost} ${btn.sm}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${row.material}`}
                className={`${btn.base} ${btn.danger} ${btn.sm}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && !confirmingDelete ? (
        <p
          role="alert"
          aria-live="polite"
          className="text-[11.5px] text-neg sm:w-full sm:text-right"
        >
          {error}
        </p>
      ) : null}
    </li>
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
    <div className="border-t border-border-strong bg-surface-2 px-3 py-3">
      <form
        ref={formRef}
        action={handleAdd}
        className="flex flex-col gap-2 xs:flex-row xs:flex-wrap xs:items-center"
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
          className={`${input} min-w-0 xs:flex-1 xs:basis-44`}
        />
        <input
          id="new-price"
          name="price"
          inputMode="decimal"
          required
          placeholder="0"
          aria-label="Price"
          autoComplete="off"
          className={`${input} tnum w-full text-right xs:w-28`}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`${btn.base} ${btn.primary} h-10 w-full justify-center px-4 text-sm xs:h-9 xs:w-auto`}
        >
          <Icon path={icons.plus} size={14} />
          {isPending ? "Adding…" : "Add expense"}
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
