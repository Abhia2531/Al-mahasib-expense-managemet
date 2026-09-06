# Al Mahasib — Project Finance Management

Track expenses, advance payments and progress billing **separately for every
project**. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and
Supabase (Postgres + Auth).

Sign-in is required. Every signed-in user shares the same projects
("shared workspace"). There is no sign-up page — accounts are created in the
Supabase dashboard.

---

## Getting started

### 1. Environment

Open **Supabase Dashboard → Project Settings → API Keys** and copy into `.env`
(it is gitignored — never commit it):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Both values are **public by design** — they are inlined into the browser
bundle. There is no secret / service-role key: access control lives entirely
in Supabase Auth + Row Level Security.

### 2. Database — run two SQL files

In **SQL Editor → New query**, run each once:

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, views, indexes,
   triggers, RLS enabled.
2. [`supabase/auth-policies.sql`](supabase/auth-policies.sql) — grants the
   `authenticated` role read/write; `anon` stays locked out.

### 3. Create your login

**Authentication → Users → Add user.** Tick **Auto Confirm User**. Repeat for
each person who needs access. (No self-service sign-up by design.)

### 4. Verify, then run

```bash
npm install
npm run check:supabase   # reports which of the steps above is outstanding
npm run dev              # http://localhost:3000  -> sign in at /login
```

> **Editing `.env` while `npm run dev` is running does nothing.** Next.js reads
> it only at startup — stop the server (Ctrl+C) and start it again.

---

## How the data is kept separate

The requirement that matters most is that **no figure ever mixes two
projects**. Three things enforce it:

1. **Schema** — `daily_expenses`, `advances` and `progress_bills` each carry a
   `project_id` foreign key with `on delete cascade`. There is no way to store
   a financial record that is not attached to exactly one project.
2. **Reads** — every query lives in [`src/lib/queries.ts`](src/lib/queries.ts)
   and is filtered by `.eq("project_id", …)`. No function in that file can
   return rows from two projects.
3. **Writes** — every action in [`src/lib/actions.ts`](src/lib/actions.ts)
   re-reads `project_id` from the submitted form and adds it to the `update` /
   `delete` filter, so a record cannot be edited or removed from a project
   other than the one on screen.

Totals are computed **in the database**, by the `project_financials` view, not
by pulling rows into JavaScript and summing them. A project with 50,000 expense
lines still renders its dashboard from a single row.

---

## Security model

Layered, so a mistake in one layer is caught by the next.

**Authentication — [`src/proxy.ts`](src/proxy.ts).** Runs before every route.
No valid Supabase session ⇒ redirect to `/login` (remembering `?next=`). A
signed-in user hitting `/login` is sent home. `getUser()` there revalidates
the token with Supabase, never trusting the cookie alone.

**Authorisation — [`supabase/auth-policies.sql`](supabase/auth-policies.sql).**
RLS is on for every table. `authenticated` ⇒ full read/write (shared
workspace); `anon` ⇒ nothing. These policies *are* the access control — there
is no service-role key to bypass them. Every query runs as the signed-in user
via `@supabase/ssr`.

**Defence in depth.** [`requireUser()`](src/lib/auth.ts) is also called inside
every function in `queries.ts`, every Server Action, and the project layout —
so a route added later without a proxy match still is not open, and RLS behind
it still returns nothing.

**No secrets in the bundle.** The only env vars are the two public
`NEXT_PUBLIC_` values. [`src/lib/supabase/server.ts`](src/lib/supabase/server.ts)
imports `server-only`; the browser client uses the publishable key, which is
meant to ship to the browser.

**HTTP hardening — [`next.config.ts`](next.config.ts).** CSP, HSTS,
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
`Permissions-Policy`; `X-Powered-By` removed.

**Server Actions — [`src/lib/actions.ts`](src/lib/actions.ts).** Each wrapped
by `run()`: auth check first; unexpected Postgres errors are logged
server-side and returned to the client as a generic sentence (never the raw
DB error); string inputs are length-capped; ids are UUID-validated.
`/auth/signout` is POST + same-origin only.

### Moving to per-user data later

Add `owner_id uuid references auth.users default auth.uid()` to `projects`,
backfill it, then change the policies in `auth-policies.sql` from
`using (true)` to `using (owner_id = auth.uid())`. No app-code change needed —
the queries already run as the user.

### Enabling self-service sign-up later

Build a `/signup` page that calls `supabase.auth.signUp`, add `/signup` to
`PUBLIC_PATHS` in [`src/lib/supabase/proxy.ts`](src/lib/supabase/proxy.ts),
and consider gating it behind an invite code.

---

## Screens

| Route | What it does |
| --- | --- |
| `/` | Logo, New Project button, searchable list of all projects |
| `/projects/new` | Create form; opens the new project's dashboard on save |
| `/projects/[id]` | Dashboard — all figures for that project only |
| `/projects/[id]/expenses` | Index of daily expense pages, newest first |
| `/projects/[id]/expenses/[date]` | **One day's page**: Material \| Price + Daily Total |
| `/projects/[id]/advances` | Record and list advance payments |
| `/projects/[id]/billing` | Progress bills: raise, edit, delete |
| `/projects/[id]/reports` | Full financial summary + per-day, per-advance, per-bill breakdowns |

A day's page exists as soon as you navigate to its date — there is nothing to
"create" first. `‹ Previous` / `Today` / `Next ›` move between days, and the
add-row form clears and refocuses itself after each save so a whole day can be
typed without touching the mouse.

---

## The calculations

All scoped to a single `project_id`:

```
Daily Total             = sum of prices on that date
Total Project Expenses  = sum of all daily expenses
Total Advance Received  = sum of all advance payments
Remaining Advance       = Total Advance Received − Total Project Expenses
Total Billed            = sum of all bill amounts
Total Billing Received  = sum of all amounts received
Outstanding Billing     = Total Billed − Total Billing Received
```

---

## Design decisions worth knowing

**Billing status is derived, not typed in.** The brief lists Billing Status as
a field the user records. It is instead a Postgres `GENERATED` column:

```
amount_received = 0            → Pending
0 < amount_received < bill      → Partially Paid
amount_received >= bill_amount → Paid
```

The status can never contradict the amounts it sits next to, and there is one
less field to get wrong during entry. Update **Amount received** as payments
arrive and the status follows. If you would rather set it by hand, drop the
`generated always as (…) stored` clause and make it a plain `text` column with
a check constraint.

**"Advance Payment Received" on the create form** is saved as the project's
first row in `advances`, not as a column on `projects`. That way every advance
— the initial one and every later payment — is counted the same way, from one
place.

**`amount_received` cannot exceed `bill_amount`**, enforced by a check
constraint as well as in the form. Bill numbers are unique per project, not
globally, so two projects can both have an "IPC-01".

**Daily expenses hold only what was asked for**: `project_id`, `expense_date`,
`material`, `price`. No category, payment method, description or notes column
exists in that table. The date lives on the page, so the table on screen is
just **Material | Price**.

**Deleting is available for advances and bills** even though the brief only
asked for it on expenses — a finance record entered by mistake has to be
correctable. Every delete asks for confirmation inline first.

---

## Project structure

```
src/
  proxy.ts                          auth gate + session refresh (Next 16)
  app/
    layout.tsx                      <AppHeader/> + shell
    login/page.tsx                  sign-in
    auth/signout/route.ts           POST-only sign-out
    page.tsx                        homepage: search + project list
    projects/new/page.tsx           create form
    projects/[id]/                  layout + dashboard/expenses/advances/billing/reports
  components/                       UI, split client/server
  lib/
    auth.ts                         getUser / requireUser / requireUserInAction
    supabase/
      env.ts                        the two public env vars
      server.ts                     request-scoped, RLS-bound (server-only)
      client.ts                     browser client (login form only)
      proxy.ts                      updateSession() used by src/proxy.ts
    queries.ts                      all reads  — auth-checked, project-scoped
    actions.ts                      all writes — auth-checked, "use server"
    action-state.ts                 ActionState / idleState (see below)
    types.ts                        row types + Database generic
    format.ts                       money and date formatting
scripts/check-supabase.mjs          `npm run check:supabase`
supabase/schema.sql                 tables + views (run once)
supabase/auth-policies.sql          grants + RLS policies (run once)
```

Database logic lives entirely in `src/lib/`. Components receive plain data and
call Server Actions; none of them build queries.

### Three things that will bite you

- The row types in `types.ts` are **`type` aliases, not `interface`s**, and
  that is load-bearing. postgrest-js requires each `Row` to satisfy
  `Record<string, unknown>`, and TypeScript only gives implicit index
  signatures to type aliases. Change one to `interface` and
  `Database["public"]` stops matching `GenericSchema`, at which point every
  query silently resolves to `never`.
- Each table and view needs a `Relationships` key for the same reason. They are
  empty arrays here because joins happen in SQL, inside the views.
- `actions.ts` has `"use server"`, so it may **only export async functions**.
  The `ActionState` type and the `idleState` constant therefore live in
  `action-state.ts` — a plain module both the actions and the client
  components import. `next build` does not flag a stray non-function export
  here; only the dev/runtime action loader does, with
  *"a 'use server' file can only export async functions"*.

---

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build (also typechecks)
npm run start    # serve the production build
npm run lint     # eslint
```

---

## Dates and money

Dates are handled as plain `YYYY-MM-DD` strings and never passed through
`new Date("YYYY-MM-DD")`, which parses as UTC and would shift every date back a
day in Pakistan (UTC+5). Money uses `numeric(14,2)` / `numeric(16,2)` in
Postgres and is rendered with tabular figures so columns line up.
