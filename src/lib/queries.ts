import "server-only";

import { cache } from "react";

import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import type {
  Advance,
  DailyExpense,
  DailyExpenseTotal,
  ProgressBill,
  Project,
  ProjectFinancials,
} from "@/lib/types";

/**
 * Every read in the app lives here.
 *
 * - Each function calls `requireUser()` first, so a signed-out caller never
 *   reaches the database.
 * - The client is the request-scoped, RLS-bound one from
 *   `getServerSupabase()` — it runs as the signed-in user. The policies in
 *   supabase/auth-policies.sql give any authenticated user full read access
 *   (shared workspace) and `anon` nothing.
 * - Any query touching money is filtered by `project_id`, so no function here
 *   can return rows from two projects at once.
 */

/** PostgREST `or()` uses `,` and `()` as syntax — strip them from user input. */
function sanitiseSearch(term: string): string {
  return term.replace(/[,()*\\%]/g, " ").trim().slice(0, 100);
}

function fail(context: string, error: { message: string }): never {
  // Log the real Postgres error server-side; surface a short message.
  console.error(`[queries] ${context}: ${error.message}`);
  throw new Error(`Could not load ${context}.`);
}

function normaliseFinancials(row: ProjectFinancials): ProjectFinancials {
  return {
    ...row,
    contract_value: toNumber(row.contract_value),
    total_expenses: toNumber(row.total_expenses),
    expense_days: toNumber(row.expense_days),
    total_advance_received: toNumber(row.total_advance_received),
    remaining_advance: toNumber(row.remaining_advance),
    total_billed: toNumber(row.total_billed),
    total_billing_received: toNumber(row.total_billing_received),
    outstanding_billing: toNumber(row.outstanding_billing),
    bill_count: toNumber(row.bill_count),
  };
}

/** All projects, newest first, with their headline figures. */
export async function listProjects(search?: string): Promise<ProjectFinancials[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  let query = supabase
    .from("project_financials")
    .select("*")
    .order("created_at", { ascending: false });

  const term = sanitiseSearch(search ?? "");
  if (term) {
    query = query.or(
      `project_name.ilike.%${term}%,` +
        `client_name.ilike.%${term}%,` +
        `location.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) fail("projects", error);
  return (data ?? []).map(normaliseFinancials);
}

/**
 * One project's full financial picture, or null if the id does not exist.
 *
 * Wrapped in React `cache` because the project layout and the page rendered
 * inside it both need these figures — this way that costs one query, not two.
 */
export const getProjectFinancials = cache(
  async (projectId: string): Promise<ProjectFinancials | null> => {
    await requireUser();
    const supabase = await getServerSupabase();

    const { data, error } = await supabase
      .from("project_financials")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) fail("this project", error);
    return data ? normaliseFinancials(data) : null;
  },
);

/** The raw project row — for the edit form. Null if it does not exist. */
export async function getProject(projectId: string): Promise<Project | null> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) fail("this project", error);
  return data
    ? { ...data, contract_value: toNumber(data.contract_value) }
    : null;
}

export interface ExpenseHit {
  id: string;
  expense_date: string;
  material: string;
  price: number;
}

/**
 * Find every purchase whose item name contains the search words, across the
 * whole project. Forgiving: case-insensitive, and each whitespace-separated
 * word only has to appear somewhere in the name (so "white paint" finds
 * "Paint, white emulsion"). Newest purchase first.
 */
export async function searchExpenses(
  projectId: string,
  rawTerm: string,
): Promise<ExpenseHit[]> {
  await requireUser();

  const words = sanitiseSearch(rawTerm)
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 6);
  if (words.length === 0) return [];

  const supabase = await getServerSupabase();
  let query = supabase
    .from("daily_expenses")
    .select("id,expense_date,material,price")
    .eq("project_id", projectId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  for (const word of words) {
    query = query.ilike("material", `%${word}%`);
  }

  const { data, error } = await query;
  if (error) fail("expense search", error);
  return (data ?? []).map((row) => ({
    id: row.id,
    expense_date: row.expense_date,
    material: row.material,
    price: toNumber(row.price),
  }));
}

/** Every expense line for a project, newest first — used by the report. */
export async function listAllExpenses(
  projectId: string,
): Promise<DailyExpense[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("daily_expenses")
    .select("*")
    .eq("project_id", projectId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) fail("expenses", error);
  return (data ?? []).map((row) => ({ ...row, price: toNumber(row.price) }));
}

/** The index of daily expense pages for one project, newest day first. */
export async function listExpenseDays(
  projectId: string,
): Promise<DailyExpenseTotal[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("daily_expense_totals")
    .select("*")
    .eq("project_id", projectId)
    .order("expense_date", { ascending: false });

  if (error) fail("expense days", error);
  return (data ?? []).map((row) => ({
    ...row,
    line_count: toNumber(row.line_count),
    daily_total: toNumber(row.daily_total),
  }));
}

/** Every material line on one day, for one project. */
export async function listExpensesForDay(
  projectId: string,
  expenseDate: string,
): Promise<DailyExpense[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("daily_expenses")
    .select("*")
    .eq("project_id", projectId)
    .eq("expense_date", expenseDate)
    .order("created_at", { ascending: true });

  if (error) fail("expenses", error);
  return (data ?? []).map((row) => ({ ...row, price: toNumber(row.price) }));
}

export async function listAdvances(projectId: string): Promise<Advance[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("advances")
    .select("*")
    .eq("project_id", projectId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) fail("advances", error);
  return (data ?? []).map((row) => ({ ...row, amount: toNumber(row.amount) }));
}

export async function listBills(projectId: string): Promise<ProgressBill[]> {
  await requireUser();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("progress_bills")
    .select("*")
    .eq("project_id", projectId)
    .order("bill_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) fail("bills", error);
  return (data ?? []).map((row) => ({
    ...row,
    progress_percentage: toNumber(row.progress_percentage),
    bill_amount: toNumber(row.bill_amount),
    amount_received: toNumber(row.amount_received),
  }));
}
