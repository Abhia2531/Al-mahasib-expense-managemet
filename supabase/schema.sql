-- =====================================================================
--  Project Finance Management System — Supabase / PostgreSQL schema
--  Run once in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================
--  Security model
--  --------------
--  RLS is ENABLED on every table and NO policies are granted to the
--  `anon` / `authenticated` roles. The publishable (anon) key can
--  therefore read/write NOTHING, even if it leaks. All database access
--  happens server-side in Next.js (Server Components + Server Actions)
--  using the secret key, which bypasses RLS. The secret key is never
--  imported into a client component and never reaches the browser.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

-- ---------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  project_name   text          not null check (length(btrim(project_name)) > 0),
  client_name    text          not null default '',
  location       text          not null default '',
  start_date     date,
  contract_value numeric(16,2) not null default 0 check (contract_value >= 0),
  description    text          not null default '',
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_name_idx       on public.projects (lower(project_name));
create index if not exists projects_client_idx     on public.projects (lower(client_name));

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- daily_expenses
--   One row = one material/price line on one day, for one project.
--   The page's date lives on the row (expense_date). There is
--   deliberately NO category / payment method / description / notes.
-- ---------------------------------------------------------------------
create table if not exists public.daily_expenses (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid          not null references public.projects (id) on delete cascade,
  expense_date date          not null,
  material     text          not null check (length(btrim(material)) > 0),
  price        numeric(14,2) not null default 0 check (price >= 0),
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

-- Primary access pattern: "every row for this project on this day".
create index if not exists daily_expenses_project_date_idx
  on public.daily_expenses (project_id, expense_date desc);
create index if not exists daily_expenses_project_idx
  on public.daily_expenses (project_id);

drop trigger if exists daily_expenses_set_updated_at on public.daily_expenses;
create trigger daily_expenses_set_updated_at
  before update on public.daily_expenses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- advances
-- ---------------------------------------------------------------------
create table if not exists public.advances (
  id           uuid          primary key default gen_random_uuid(),
  project_id   uuid          not null references public.projects (id) on delete cascade,
  payment_date date          not null default current_date,
  amount       numeric(16,2) not null default 0 check (amount >= 0),
  notes        text          not null default '',
  created_at   timestamptz   not null default now()
);

create index if not exists advances_project_date_idx
  on public.advances (project_id, payment_date desc);

-- ---------------------------------------------------------------------
-- progress_bills
--   `status` is a GENERATED column derived from the amounts, so it can
--   never contradict them. See README, "Design decisions".
-- ---------------------------------------------------------------------
create table if not exists public.progress_bills (
  id                  uuid          primary key default gen_random_uuid(),
  project_id          uuid          not null references public.projects (id) on delete cascade,
  bill_number         text          not null check (length(btrim(bill_number)) > 0),
  bill_date           date          not null default current_date,
  work_description    text          not null default '',
  progress_percentage numeric(5,2)  not null default 0
                        check (progress_percentage >= 0 and progress_percentage <= 100),
  bill_amount         numeric(16,2) not null default 0 check (bill_amount >= 0),
  amount_received     numeric(16,2) not null default 0 check (amount_received >= 0),
  status              text generated always as (
                        case
                          when amount_received <= 0           then 'pending'
                          when amount_received >= bill_amount then 'paid'
                          else 'partially_paid'
                        end
                      ) stored,
  notes               text          not null default '',
  created_at          timestamptz   not null default now(),
  -- money received can never exceed the bill itself
  constraint progress_bills_received_lte_amount
    check (amount_received <= bill_amount),
  -- bill numbers are unique within a project, not globally
  constraint progress_bills_unique_number_per_project
    unique (project_id, bill_number)
);

create index if not exists progress_bills_project_date_idx
  on public.progress_bills (project_id, bill_date desc);
create index if not exists progress_bills_status_idx
  on public.progress_bills (project_id, status);

-- ---------------------------------------------------------------------
-- Aggregate views
--   Totals are computed in the database, so the dashboard never pulls
--   thousands of expense rows into the app just to add them up.
-- ---------------------------------------------------------------------

-- One row per project+date: powers the "daily expense pages" index.
create or replace view public.daily_expense_totals
with (security_invoker = true) as
select
  project_id,
  expense_date,
  count(*)::bigint        as line_count,
  coalesce(sum(price), 0) as daily_total
from public.daily_expenses
group by project_id, expense_date;

-- One row per project: every number the dashboard needs, pre-aggregated.
create or replace view public.project_financials
with (security_invoker = true) as
select
  p.id            as project_id,
  p.project_name,
  p.client_name,
  p.location,
  p.start_date,
  p.contract_value,
  p.description,
  p.created_at,
  p.updated_at,
  coalesce(e.total_expenses, 0)                                as total_expenses,
  coalesce(e.expense_days, 0)                                  as expense_days,
  coalesce(a.total_advance, 0)                                 as total_advance_received,
  coalesce(a.total_advance, 0) - coalesce(e.total_expenses, 0) as remaining_advance,
  coalesce(b.total_billed, 0)                                  as total_billed,
  coalesce(b.total_received, 0)                                as total_billing_received,
  coalesce(b.total_billed, 0) - coalesce(b.total_received, 0)  as outstanding_billing,
  coalesce(b.bill_count, 0)                                    as bill_count
from public.projects p
left join (
  select project_id,
         sum(price)                   as total_expenses,
         count(distinct expense_date) as expense_days
  from public.daily_expenses
  group by project_id
) e on e.project_id = p.id
left join (
  select project_id, sum(amount) as total_advance
  from public.advances
  group by project_id
) a on a.project_id = p.id
left join (
  select project_id,
         sum(bill_amount)     as total_billed,
         sum(amount_received) as total_received,
         count(*)             as bill_count
  from public.progress_bills
  group by project_id
) b on b.project_id = p.id;

-- ---------------------------------------------------------------------
-- Row Level Security — deny by default.
--   Enabled with zero policies => anon/authenticated get nothing.
--   Only the secret key (service_role), used server-side, can read/write.
-- ---------------------------------------------------------------------
alter table public.projects       enable row level security;
alter table public.daily_expenses enable row level security;
alter table public.advances       enable row level security;
alter table public.progress_bills enable row level security;

-- Deliberately NOT using `force row level security`. FORCE only changes
-- behaviour for the *table owner*, which this app never connects as, so it
-- would add no protection here — but it would add a failure mode: on any
-- setup where service_role lacks the BYPASSRLS attribute, every query would
-- start returning zero rows with no error to explain why.

-- Belt and braces: drop the blanket grants Supabase gives these roles.
revoke all on public.projects, public.daily_expenses,
              public.advances, public.progress_bills
  from anon, authenticated;
revoke all on public.project_financials, public.daily_expense_totals
  from anon, authenticated;

-- ---------------------------------------------------------------------
-- After running this, PostgREST needs to pick up the new tables. Supabase
-- reloads its schema cache automatically within a few seconds. If the app
-- still reports a missing table, force it with:
--     notify pgrst, 'reload schema';
-- ---------------------------------------------------------------------
