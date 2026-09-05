"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabase } from "@/lib/supabase";
import { isValidISODate, todayISO } from "@/lib/format";
import type { ActionState } from "@/lib/action-state";

/**
 * Every write in the app lives here. Each action re-reads `project_id` from
 * the submitted form and scopes the query to it, so a record can never land
 * on — or be deleted from — a project other than the one on screen.
 *
 * `ActionState` / `idleState` live in `./action-state` because a `"use server"`
 * module may only export async functions.
 */

/* ------------------------------------------------------------------ */
/* parsing helpers                                                     */
/* ------------------------------------------------------------------ */

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Accepts `50,000`, `50000`, `50000.50`, or blank (-> 0). */
function money(form: FormData, key: string): number {
  const raw = text(form, key).replace(/,/g, "");
  if (!raw) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.round(n * 100) / 100;
}

function fail(message: string): ActionState {
  return { ok: false, error: message };
}

function requireUUID(value: string, label: string): string {
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
  if (!ok) throw new Error(`Invalid ${label}.`);
  return value;
}

/* ------------------------------------------------------------------ */
/* projects                                                            */
/* ------------------------------------------------------------------ */

export async function createProjectAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const projectName = text(form, "project_name");
  if (!projectName) return fail("Project name is required.");

  const contractValue = money(form, "contract_value");
  const advanceAmount = money(form, "advance_amount");
  if (Number.isNaN(contractValue)) return fail("Contract value must be a number.");
  if (Number.isNaN(advanceAmount)) return fail("Advance payment must be a number.");
  if (contractValue < 0 || advanceAmount < 0)
    return fail("Amounts cannot be negative.");

  const startDate = text(form, "start_date");
  if (startDate && !isValidISODate(startDate)) return fail("Start date is invalid.");

  const supabase = getSupabase();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      project_name: projectName,
      client_name: text(form, "client_name"),
      location: text(form, "location"),
      start_date: startDate || null,
      contract_value: contractValue,
      description: text(form, "description"),
    })
    .select("id")
    .single();

  if (error || !project) {
    return fail(error?.message ?? "Could not create the project.");
  }

  // "Advance Payment Received" on the create form becomes the project's
  // first row in `advances`, so all advance maths has a single source.
  if (advanceAmount > 0) {
    const { error: advanceError } = await supabase.from("advances").insert({
      project_id: project.id,
      payment_date: startDate || todayISO(),
      amount: advanceAmount,
      notes: "Initial advance recorded at project creation",
    });
    if (advanceError) {
      return fail(
        `Project created, but the advance could not be saved: ${advanceError.message}`,
      );
    }
  }

  revalidatePath("/");
  // redirect() signals via a thrown control-flow error — keep it out of try/catch.
  redirect(`/projects/${project.id}`);
}

/* ------------------------------------------------------------------ */
/* daily expenses                                                      */
/* ------------------------------------------------------------------ */

export async function addExpenseAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const projectId = requireUUID(text(form, "project_id"), "project");
  const expenseDate = text(form, "expense_date");
  const material = text(form, "material");
  const price = money(form, "price");

  if (!isValidISODate(expenseDate)) return fail("Expense date is invalid.");
  if (!material) return fail("Material name is required.");
  if (Number.isNaN(price)) return fail("Price must be a number.");
  if (price < 0) return fail("Price cannot be negative.");

  const { error } = await getSupabase().from("daily_expenses").insert({
    project_id: projectId,
    expense_date: expenseDate,
    material,
    price,
  });

  if (error) return fail(error.message);

  revalidateProject(projectId, expenseDate);
  return { ok: true };
}

export async function updateExpenseAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const id = requireUUID(text(form, "id"), "expense");
  const projectId = requireUUID(text(form, "project_id"), "project");
  const expenseDate = text(form, "expense_date");
  const material = text(form, "material");
  const price = money(form, "price");

  if (!material) return fail("Material name is required.");
  if (Number.isNaN(price)) return fail("Price must be a number.");
  if (price < 0) return fail("Price cannot be negative.");

  const { error } = await getSupabase()
    .from("daily_expenses")
    .update({ material, price })
    .eq("id", id)
    .eq("project_id", projectId); // scope guard

  if (error) return fail(error.message);

  revalidateProject(projectId, expenseDate);
  return { ok: true };
}

export async function deleteExpenseAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const id = requireUUID(text(form, "id"), "expense");
  const projectId = requireUUID(text(form, "project_id"), "project");
  const expenseDate = text(form, "expense_date");

  const { error } = await getSupabase()
    .from("daily_expenses")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId); // scope guard

  if (error) return fail(error.message);

  revalidateProject(projectId, expenseDate);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* advances                                                            */
/* ------------------------------------------------------------------ */

export async function addAdvanceAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const projectId = requireUUID(text(form, "project_id"), "project");
  const amount = money(form, "amount");
  const paymentDate = text(form, "payment_date") || todayISO();

  if (Number.isNaN(amount)) return fail("Amount must be a number.");
  if (amount <= 0) return fail("Amount must be greater than zero.");
  if (!isValidISODate(paymentDate)) return fail("Payment date is invalid.");

  const { error } = await getSupabase().from("advances").insert({
    project_id: projectId,
    payment_date: paymentDate,
    amount,
    notes: text(form, "notes"),
  });

  if (error) return fail(error.message);

  revalidateProject(projectId);
  return { ok: true };
}

export async function deleteAdvanceAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const id = requireUUID(text(form, "id"), "advance");
  const projectId = requireUUID(text(form, "project_id"), "project");

  const { error } = await getSupabase()
    .from("advances")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId);

  if (error) return fail(error.message);

  revalidateProject(projectId);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* progress bills                                                      */
/* ------------------------------------------------------------------ */

function readBillFields(form: FormData):
  | { ok: true; value: BillFields }
  | { ok: false; error: string } {
  const billNumber = text(form, "bill_number");
  if (!billNumber) return { ok: false, error: "Bill number is required." };

  const billDate = text(form, "bill_date") || todayISO();
  if (!isValidISODate(billDate))
    return { ok: false, error: "Bill date is invalid." };

  const billAmount = money(form, "bill_amount");
  const amountReceived = money(form, "amount_received");
  const progress = money(form, "progress_percentage");

  if (Number.isNaN(billAmount) || Number.isNaN(amountReceived))
    return { ok: false, error: "Amounts must be numbers." };
  if (Number.isNaN(progress))
    return { ok: false, error: "Progress percentage must be a number." };
  if (billAmount < 0 || amountReceived < 0)
    return { ok: false, error: "Amounts cannot be negative." };
  if (progress < 0 || progress > 100)
    return { ok: false, error: "Progress must be between 0 and 100." };
  if (amountReceived > billAmount)
    return {
      ok: false,
      error: "Amount received cannot be more than the bill amount.",
    };

  return {
    ok: true,
    value: {
      bill_number: billNumber,
      bill_date: billDate,
      work_description: text(form, "work_description"),
      progress_percentage: progress,
      bill_amount: billAmount,
      amount_received: amountReceived,
      notes: text(form, "notes"),
    },
  };
}

interface BillFields {
  bill_number: string;
  bill_date: string;
  work_description: string;
  progress_percentage: number;
  bill_amount: number;
  amount_received: number;
  notes: string;
}

/** Turns the unique-constraint violation into a sentence a human can act on. */
function billError(message: string, code?: string): string {
  if (code === "23505")
    return "That bill number is already used on this project.";
  return message;
}

export async function addBillAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const projectId = requireUUID(text(form, "project_id"), "project");
  const parsed = readBillFields(form);
  if (!parsed.ok) return fail(parsed.error);

  const { error } = await getSupabase()
    .from("progress_bills")
    .insert({ project_id: projectId, ...parsed.value });

  if (error) return fail(billError(error.message, error.code));

  revalidateProject(projectId);
  return { ok: true };
}

export async function updateBillAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const id = requireUUID(text(form, "id"), "bill");
  const projectId = requireUUID(text(form, "project_id"), "project");
  const parsed = readBillFields(form);
  if (!parsed.ok) return fail(parsed.error);

  const { error } = await getSupabase()
    .from("progress_bills")
    .update(parsed.value)
    .eq("id", id)
    .eq("project_id", projectId);

  if (error) return fail(billError(error.message, error.code));

  revalidateProject(projectId);
  return { ok: true };
}

export async function deleteBillAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const id = requireUUID(text(form, "id"), "bill");
  const projectId = requireUUID(text(form, "project_id"), "project");

  const { error } = await getSupabase()
    .from("progress_bills")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId);

  if (error) return fail(error.message);

  revalidateProject(projectId);
  return { ok: true };
}

/* ------------------------------------------------------------------ */

function revalidateProject(projectId: string, expenseDate?: string): void {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/expenses`);
  revalidatePath(`/projects/${projectId}/advances`);
  revalidatePath(`/projects/${projectId}/billing`);
  revalidatePath(`/projects/${projectId}/reports`);
  if (expenseDate) {
    revalidatePath(`/projects/${projectId}/expenses/${expenseDate}`);
  }
}
