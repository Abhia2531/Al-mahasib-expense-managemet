-- =====================================================================
--  Auth policies  --  shared workspace
--  Run once: Supabase Dashboard -> SQL Editor -> New query -> paste the
--  WHOLE contents of this file -> Run.  (Run supabase/schema.sql first.)
--  Expect: "Success. No rows returned".
-- =====================================================================
--
--  Access model
--    anon (logged out) ............ nothing
--    authenticated (logged in) .... full read/write on everything
--
--  Every logged-in user shares the same projects. To move to per-user data:
--  add `owner_id uuid references auth.users default auth.uid()` to projects,
--  backfill it, then change each policy's `using (true)` to
--  `using (owner_id = auth.uid())`.
--
--  There is no service-role key in the app. These policies ARE the access
--  control.
-- =====================================================================

-- 1. Table privileges for the `authenticated` role (schema.sql revoked them).
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

-- 2. Make sure `anon` keeps nothing.
revoke all on
  public.projects,
  public.daily_expenses,
  public.advances,
  public.progress_bills,
  public.project_financials,
  public.daily_expense_totals
from anon;

-- 3. RLS policies. RLS is already enabled by schema.sql; this adds the rules.
drop policy if exists workspace_all on public.projects;
drop policy if exists workspace_all on public.daily_expenses;
drop policy if exists workspace_all on public.advances;
drop policy if exists workspace_all on public.progress_bills;

create policy workspace_all on public.projects
  for all to authenticated using (true) with check (true);

create policy workspace_all on public.daily_expenses
  for all to authenticated using (true) with check (true);

create policy workspace_all on public.advances
  for all to authenticated using (true) with check (true);

create policy workspace_all on public.progress_bills
  for all to authenticated using (true) with check (true);

-- 4. Reload PostgREST's cache immediately (otherwise ~a few seconds).
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
--  Next: Authentication -> Users -> Add user  (tick "Auto Confirm User").
--  There is no sign-up page in the app by design.
-- ---------------------------------------------------------------------
