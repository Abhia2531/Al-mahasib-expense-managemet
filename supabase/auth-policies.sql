-- =====================================================================
--  Auth policies  --  shared workspace
--  Run once in: Supabase Dashboard -> SQL Editor -> New query -> Run
--  (Run supabase/schema.sql first if you have not already.)
-- =====================================================================
--
--  Access model
--  ------------
--  * anon (logged out) .......... nothing
--  * authenticated (logged in) .. full read/write on everything
--
--  Every logged-in user shares the same projects. To move to per-user data
--  later: add an `owner_id uuid references auth.users` column to `projects`,
--  then change the policies below to `using (owner_id = auth.uid())`.
--
--  There is no service-role key in the app. These policies ARE the access
--  control — the app cannot bypass them.
-- =====================================================================

-- 1. Table privileges for the authenticated role (schema.sql revoked them).
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.projects,
  public.daily_expenses,
  public.advances,
  public.progress_bills
to authenticated;

grant select on
  public.project_financials,
  public.daily_expense_totals
to authenticated;

-- 2. Make sure anon keeps nothing (idempotent belt-and-braces).
revoke all on
  public.projects, public.daily_expenses, public.advances, public.progress_bills,
  public.project_financials, public.daily_expense_totals
from anon;

-- 3. RLS policies. RLS is already enabled by schema.sql; add the rules.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'projects', 'daily_expenses', 'advances', 'progress_bills'
  ]
  loop
    execute format('drop policy if exists workspace_read   on public.%I', tbl);
    execute format('drop policy if exists workspace_write  on public.%I', tbl);
    execute format('drop policy if exists workspace_modify on public.%I', tbl);
    execute format('drop policy if exists workspace_delete on public.%I', tbl);

    execute format(
      'create policy workspace_read on public.%I '
      || 'for select to authenticated using (true)', tbl);
    execute format(
      'create policy workspace_write on public.%I '
      || 'for insert to authenticated with check (true)', tbl);
    execute format(
      'create policy workspace_modify on public.%I '
      || 'for update to authenticated using (true) with check (true)', tbl);
    execute format(
      'create policy workspace_delete on public.%I '
      || 'for delete to authenticated using (true)', tbl);
  end loop;
end $$;

-- 4. Reload PostgREST's cache immediately.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
--  After this runs, create your login in:
--    Authentication -> Users -> Add user  (set "Auto Confirm User")
--  There is no sign-up page in the app by design.
-- ---------------------------------------------------------------------
